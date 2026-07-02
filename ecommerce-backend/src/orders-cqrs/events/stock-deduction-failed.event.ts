import { IEvent } from '@nestjs/cqrs';

export class StockDeductionFailedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
  ) {}
}
