import { IEvent } from '@nestjs/cqrs';

export class PaymentFailedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly reason: string,
  ) {}
}
