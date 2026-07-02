import { ICommand } from '@nestjs/cqrs';

export class DeductStockCommand implements ICommand {
  constructor(
    public readonly orderId: string,
    public readonly items: { productId: string; quantity: number }[],
  ) {}
}
