import { IEvent } from '@nestjs/cqrs';

export interface OrderCreatedItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export class OrderCreatedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly userId: string,
    public readonly items: OrderCreatedItem[],
    public readonly total: number,
  ) {}
}
