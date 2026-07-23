export class Money {
  constructor(private readonly _amount: number) {
    if (_amount < 0) {
      throw new Error('Money cannot be negative');
    }
  }

  get amount(): number {
    return this._amount;
  }

  add(other: Money): Money {
    return new Money(this._amount + other._amount);
  }

  multiply(quantity: number): Money {
    return new Money(this._amount * quantity);
  }

  equals(other: Money): boolean {
    return this._amount === other._amount;
  }

  toJSON(): string {
    return `$${this._amount.toFixed(2)}`;
  }
}