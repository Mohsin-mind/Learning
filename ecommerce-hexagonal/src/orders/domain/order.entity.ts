import { Money } from '../../shared/domain/value-objects/money.js';
import {
  OrderStatus,
  canTransition,
} from '../../shared/domain/value-objects/order-status.js';
import { OrderItem } from './order-item.entity.js';
import { OrderCreatedEvent } from './events/order-created.event.js';
import { OrderStatusChangedEvent } from './events/order-status-changed.event.js';

type OrderEvent = OrderCreatedEvent | OrderStatusChangedEvent;

export class Order {
  private events: OrderEvent[] = [];

  constructor(
    public readonly id: string,
    public readonly userId: string,
    public status: OrderStatus,
    public total: Money,
    public readonly items: OrderItem[],
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    id: string,
    userId: string,
    items: OrderItem[],
  ): Order {
    const total = items.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Money(0),
    );
    const now = new Date();
    const order = new Order(
      id,
      userId,
      OrderStatus.PENDING,
      total,
      items,
      now,
      now,
    );
    order.events.push(
      new OrderCreatedEvent(id, userId, total.amount, items, now),
    );
    return order;
  }

  static reconstitute(
    id: string,
    userId: string,
    status: OrderStatus,
    total: number,
    items: OrderItem[],
    createdAt: Date,
    updatedAt: Date,
  ): Order {
    return new Order(
      id,
      userId,
      status,
      new Money(total),
      items,
      createdAt,
      updatedAt,
    );
  }

  changeStatus(newStatus: OrderStatus): void {
    if (!canTransition(this.status, newStatus)) {
      throw new Error(
        `Cannot transition from ${this.status} to ${newStatus}`,
      );
    }
    this.status = newStatus;
    this.updatedAt = new Date();
    this.events.push(
      new OrderStatusChangedEvent(this.id, this.status, this.updatedAt),
    );
  }

  pullEvents(): OrderEvent[] {
    const events = [...this.events];
    this.events = [];
    return events;
  }
}