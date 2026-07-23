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
  private _events: OrderEvent[] = [];

  private constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private _status: OrderStatus,
    private _total: Money,
    private readonly _items: OrderItem[],
    private readonly _createdAt: Date,
    private _updatedAt: Date,
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
    order._events.push(
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

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get total(): Money {
    return this._total;
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  changeStatus(newStatus: OrderStatus): void {
    if (!canTransition(this._status, newStatus)) {
      throw new Error(
        `Cannot transition from ${this._status} to ${newStatus}`,
      );
    }
    this._status = newStatus;
    this._updatedAt = new Date();
    this._events.push(
      new OrderStatusChangedEvent(this._id, this._status, this._updatedAt),
    );
  }

  pullEvents(): OrderEvent[] {
    const events = [...this._events];
    this._events = [];
    return events;
  }
}