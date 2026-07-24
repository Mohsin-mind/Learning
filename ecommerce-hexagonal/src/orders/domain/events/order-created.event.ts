import { OrderItem } from "../order-item.entity.js";

export class OrderCreatedEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly total: number,
    public readonly items: OrderItem[],
    public readonly occurredAt: Date,
  ) {}
}
