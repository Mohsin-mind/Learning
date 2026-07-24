export class Money {
  constructor(public readonly amount: number) {
    if (amount < 0) {
      throw new Error("Money cannot be negative");
    }
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  multiply(quantity: number): Money {
    return new Money(this.amount * quantity);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }
}
