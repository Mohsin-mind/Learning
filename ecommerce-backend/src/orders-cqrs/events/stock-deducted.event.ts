import { IEvent } from '@nestjs/cqrs';

export class StockDeductedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly items: { productId: string; quantity: number }[],
  ) {}
}
