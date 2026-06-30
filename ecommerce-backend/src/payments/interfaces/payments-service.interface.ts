import { Payment } from '@/payments/entities/payment.entity';

export interface IPaymentsService {
  handleWebhook(payload: {
    orderId: string;
    transactionId: string;
    amount: number;
    success: boolean;
  }): Promise<Payment>;
}

export const PAYMENTS_SERVICE_TOKEN = Symbol('PAYMENTS_SERVICE_TOKEN');
