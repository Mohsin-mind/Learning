import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Payment, PaymentStatus, PaymentProvider } from './entities/payment.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import { PaymentRepository } from './payment.repository';
import { OrderRepository } from '../orders/order.repository';
import { IPaymentsService } from './interfaces/payments-service.interface';
import { QUEUES, ORDER_JOBS } from '../common/constants/app.constants';

@Injectable()
export class PaymentsService implements IPaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    @InjectQueue(QUEUES.ORDERS) private readonly orderQueue: Queue,
  ) {}

  async handleWebhook(payload: {
    orderId: string;
    transactionId: string;
    amount: number;
    success: boolean;
  }): Promise<Payment> {
    const order = await this.orderRepository.findOne({ where: { id: payload.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Saga compensating transaction: always update order status whether payment
    // succeeded or failed. A failed payment cancels the order so it is never
    // left stuck in PENDING.
    order.status = payload.success ? OrderStatus.CONFIRMED : OrderStatus.CANCELLED;
    await this.orderRepository.save(order);

    const payment = this.paymentRepository.create({
      orderId: payload.orderId,
      amount: payload.amount,
      status: payload.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      provider: PaymentProvider.STRIPE,
      transactionId: payload.transactionId,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    await this.orderQueue.add(ORDER_JOBS.PAYMENT_PROCESSED, {
      orderId: payload.orderId,
      paymentId: savedPayment.id,
      success: payload.success,
    });

    return savedPayment;
  }
}
