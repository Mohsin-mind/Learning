import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

/**
 * OrderEventListener demonstrates the Choreography-based Saga pattern.
 *
 * Each handler reacts to a domain event and performs its own background
 * side-effect (e.g. sending emails) independently of the transaction that
 * originally produced the event. If the side-effect fails it does NOT roll
 * back the original transaction — instead a compensating event (order.failed /
 * payment.processed with success:false) triggers the relevant compensation.
 */
@Injectable()
export class OrderEventListener {
  private readonly logger = new Logger(OrderEventListener.name);

  // ─── Order placed successfully ────────────────────────────────────────────

  @OnEvent('order.created')
  handleOrderCreated(payload: {
    orderId: string;
    userId: string;
    total: number;
    itemCount: number;
  }) {
    // In a real app: call NotificationsService / mail provider here.
    this.logger.log(
      `[EMAIL] Order confirmation sent to user ${payload.userId} — ` +
        `order #${payload.orderId} (${payload.itemCount} items, $${payload.total})`,
    );
  }

  // ─── Order creation failed (Saga compensation) ────────────────────────────

  @OnEvent('order.failed')
  handleOrderFailed(payload: { userId: string; reason: string }) {
    // Saga compensating action: notify the user that their order could not
    // be placed so they can retry or contact support.
    this.logger.warn(
      `[EMAIL] Order failure notification sent to user ${payload.userId} — reason: ${payload.reason}`,
    );
  }

  // ─── Payment webhook result ───────────────────────────────────────────────

  @OnEvent('payment.processed')
  handlePaymentProcessed(payload: { orderId: string; paymentId: string; success: boolean }) {
    if (payload.success) {
      // Happy path: send payment receipt.
      this.logger.log(
        `[EMAIL] Payment receipt sent for order #${payload.orderId} (payment: ${payload.paymentId})`,
      );
    } else {
      // Saga compensating action: inform the user their payment failed and the
      // order has been cancelled so they can place a new one.
      this.logger.warn(
        `[EMAIL] Payment failure alert sent for order #${payload.orderId} — order has been cancelled`,
      );
    }
  }
}
