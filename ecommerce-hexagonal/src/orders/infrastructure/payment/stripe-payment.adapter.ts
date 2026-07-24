import { Injectable } from "@nestjs/common";
import {
  PaymentGateway,
  PaymentResult,
} from "../../application/ports/outbound/payment-gateway.port.js";

@Injectable()
export class StripePaymentAdapter implements PaymentGateway {
  async charge(orderId: string, amount: number): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `txn_${orderId}_${Date.now()}`,
    };
  }
}
