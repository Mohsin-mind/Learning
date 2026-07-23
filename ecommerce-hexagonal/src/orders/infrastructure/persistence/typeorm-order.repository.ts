import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../../domain/order.entity.js';
import { OrderItem } from '../../domain/order-item.entity.js';
import { Money } from '../../../shared/domain/value-objects/money.js';
import { OrderStatus } from '../../../shared/domain/value-objects/order-status.js';
import type { OrderRepository } from '../../application/ports/outbound/order-repository.port.js';
import { TypeOrmOrder, OrmOrderStatus } from './typeorm-order.entity.js';
import { TypeOrmOrderItem } from './typeorm-order-item.entity.js';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(TypeOrmOrder)
    private readonly repo: Repository<TypeOrmOrder>,
  ) {}

  async save(order: Order): Promise<void> {
    const ormOrder = this.toOrm(order);
    await this.repo.save(ormOrder);
  }

  async findById(id: string): Promise<Order | null> {
    const orm = await this.repo.findOne({
      where: { id },
      relations: { items: true },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async findByUser(userId: string): Promise<Order[]> {
    const orms = await this.repo.find({
      where: { userId },
      relations: { items: true },
    });
    return orms.map((o) => this.toDomain(o));
  }

  private toDomain(orm: TypeOrmOrder): Order {
    const items = orm.items.map(
      (i) =>
        new OrderItem(i.productId, i.productName, new Money(Number(i.price)), i.quantity, i.orderId, i.id),
    );
    return Order.reconstitute(
      orm.id,
      orm.userId,
      orm.status as unknown as OrderStatus,
      Number(orm.total),
      items,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(order: Order): TypeOrmOrder {
    const orm = new TypeOrmOrder();
    orm.id = order.id;
    orm.userId = order.userId;
    orm.status = order.status as unknown as OrmOrderStatus;
    orm.total = order.total.amount;
    orm.items = order.items.map((item) => {
      const oi = new TypeOrmOrderItem();
      oi.productId = item.productId;
      oi.productName = item.productName;
      oi.price = item.price.amount;
      oi.quantity = item.quantity;
      return oi;
    });
    return orm;
  }
}