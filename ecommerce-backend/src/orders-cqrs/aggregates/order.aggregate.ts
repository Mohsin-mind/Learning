import { AggregateRoot } from '@nestjs/cqrs';
import { OrderCreatedEvent, OrderCreatedItem } from '../events/order-created.event';
import { OrderStatus } from '@/orders/entities/order.entity';

export class OrderAggregate extends AggregateRoot {
  private _id: string;
  private _userId: string;
  private _items: OrderCreatedItem[];
  private _total: number;
  private _status: OrderStatus;

  get id(): string {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get status(): OrderStatus {
    return this._status;
  }

  create(userId: string, items: OrderCreatedItem[], total: number): void {
    this.apply(new OrderCreatedEvent(crypto.randomUUID(), userId, items, total));
  }

  confirm(): void {
    this._status = OrderStatus.CONFIRMED;
  }

  cancel(): void {
    this._status = OrderStatus.CANCELLED;
  }

  private onOrderCreatedEvent(event: OrderCreatedEvent): void {
    this._id = event.orderId;
    this._userId = event.userId;
    this._items = event.items;
    this._total = event.total;
    this._status = OrderStatus.PENDING;
  }
}
