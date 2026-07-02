import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { GetOrderQuery } from './get-order.query';
import { OrderRepository } from '@/orders/order.repository';

@Injectable()
@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(query: GetOrderQuery): Promise<{
    orderId: string;
    userId: string;
    total: number;
    status: string;
    items: { productId: string; quantity: number }[];
    createdAt: Date;
  }> {
    const order = await this.orderRepository.findOne({
      where: { id: query.orderId },
      relations: { items: true },
    });
    if (!order) {
      throw new NotFoundException(`Order ${query.orderId} not found`);
    }
    return {
      orderId: order.id,
      userId: order.userId,
      total: Number(order.total),
      status: order.status,
      items: order.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      createdAt: order.createdAt,
    };
  }
}
