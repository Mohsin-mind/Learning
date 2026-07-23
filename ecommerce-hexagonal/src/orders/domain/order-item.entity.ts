import { Money } from '../../shared/domain/value-objects/money.js';

export class OrderItem {
  constructor(
    private readonly _productId: string,
    private readonly _productName: string,
    private readonly _price: Money,
    private readonly _quantity: number,
    private readonly _orderId?: string,
    private readonly _id?: string,
  ) {}

  get id(): string | undefined {
    return this._id;
  }

  get orderId(): string | undefined {
    return this._orderId;
  }

  get productId(): string {
    return this._productId;
  }

  get productName(): string {
    return this._productName;
  }

  get price(): Money {
    return this._price;
  }

  get quantity(): number {
    return this._quantity;
  }

  get subtotal(): Money {
    return this._price.multiply(this._quantity);
  }
}