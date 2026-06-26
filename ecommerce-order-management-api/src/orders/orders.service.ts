import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderRepository } from './order.repository';
import { ProductRepository } from '../products/product.repository';
import { IOrdersService } from './interfaces/orders-service.interface';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async create(
    userId: string,
    dto: { items: { productId: string; quantity: number }[] },
  ): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const item of dto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }

      const orderItem = new OrderItem();
      orderItem.productId = product.id;
      orderItem.productName = product.name;
      orderItem.price = Number(product.price);
      orderItem.quantity = item.quantity;
      orderItems.push(orderItem);

      total += Number(product.price) * item.quantity;
    }

    const order = new Order();
    order.userId = userId;
    order.total = total;
    order.status = OrderStatus.PENDING;
    order.items = orderItems;

    return this.orderRepository.save(order);
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderRepository.find({
      where: { userId },
      relations: { items: true },
    });
  }

  async findById(id: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id },
      relations: { items: true },
    });
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = status as OrderStatus;
    return this.orderRepository.save(order);
  }
}
