import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment, PaymentStatus, PaymentProvider } from './entities/payment.entity';
import { OrderStatus } from '../orders/entities/order.entity';
import { PaymentRepository } from './payment.repository';
import { OrderRepository } from '../orders/order.repository';
import { IPaymentsService } from './interfaces/payments-service.interface';

@Injectable()
export class PaymentsService implements IPaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly orderRepository: OrderRepository,
    private readonly eventEmitter: EventEmitter2,
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

    if (payload.success) {
      order.status = OrderStatus.CONFIRMED;
      await this.orderRepository.save(order);
    }

    const payment = this.paymentRepository.create({
      orderId: payload.orderId,
      amount: payload.amount,
      status: payload.success ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      provider: PaymentProvider.STRIPE,
      transactionId: payload.transactionId,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    this.eventEmitter.emit('payment.processed', {
      orderId: payload.orderId,
      paymentId: savedPayment.id,
      success: payload.success,
    });

    return savedPayment;
  }
}
