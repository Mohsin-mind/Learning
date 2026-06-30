import { Payment } from '../entities/payment.entity';
export interface IPaymentsService {
    handleWebhook(payload: {
        orderId: string;
        transactionId: string;
        amount: number;
        success: boolean;
    }): Promise<Payment>;
}
export declare const PAYMENTS_SERVICE_TOKEN: unique symbol;
