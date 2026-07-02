import { ICommand } from '@nestjs/cqrs';

export class CreateOrderCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly items: { productId: string; quantity: number }[],
  ) {}
}
