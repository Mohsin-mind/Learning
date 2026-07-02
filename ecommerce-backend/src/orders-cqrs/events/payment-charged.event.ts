import { IEvent } from '@nestjs/cqrs';

export class PaymentChargedEvent implements IEvent {
  constructor(
    public readonly orderId: string,
    public readonly amount: number,
  ) {}
}
