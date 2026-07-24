import { Money } from '../../shared/domain/value-objects/money.js';

export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly price: Money,
    public readonly quantity: number,
    public readonly orderId?: string,
    public readonly id?: string,
  ) {}

  get subtotal(): Money {
    return this.price.multiply(this.quantity);
  }
}