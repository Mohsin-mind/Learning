export const PAYMENT_GATEWAY = Symbol("PaymentGateway");

export type PaymentResult = {
  success: boolean;
  transactionId: string;
};

export interface PaymentGateway {
  charge(orderId: string, amount: number): Promise<PaymentResult>;
}
