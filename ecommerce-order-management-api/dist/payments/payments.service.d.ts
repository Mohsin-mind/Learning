import { Queue } from 'bullmq';
import { Payment } from './entities/payment.entity';
import { PaymentRepository } from './payment.repository';
import { OrderRepository } from '../orders/order.repository';
import { IPaymentsService } from './interfaces/payments-service.interface';
export declare class PaymentsService implements IPaymentsService {
    private readonly paymentRepository;
    private readonly orderRepository;
    private readonly orderQueue;
    constructor(paymentRepository: PaymentRepository, orderRepository: OrderRepository, orderQueue: Queue);
    handleWebhook(payload: {
        orderId: string;
        transactionId: string;
        amount: number;
        success: boolean;
    }): Promise<Payment>;
}
