import { ICommand } from '@nestjs/cqrs';

export class ChargePaymentCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly amount: number,
  ) {}
}
