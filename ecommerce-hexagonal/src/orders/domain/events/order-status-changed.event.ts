import { OrderStatus } from '../../../shared/domain/value-objects/order-status.js';

export class OrderStatusChangedEvent {
  constructor(
    public readonly orderId: string,
    public readonly newStatus: OrderStatus,
    public readonly occurredAt: Date,
  ) {}
}