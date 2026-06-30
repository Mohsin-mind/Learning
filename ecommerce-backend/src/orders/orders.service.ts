import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderRepository } from './order.repository';
import { ProductRepository } from '../products/product.repository';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { IOrdersService } from './interfaces/orders-service.interface';
import { QUEUES, ORDER_JOBS } from '../common/constants/app.constants';

@Injectable()
export class OrdersService implements IOrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly productRepository: ProductRepository,
    @InjectQueue(QUEUES.ORDERS) private readonly orderQueue: Queue,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    dto: { items: { productId: string; quantity: number }[] },
  ): Promise<Order> {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    try {
      const savedOrder = await this.dataSource.transaction(async (manager) => {
        const orderItems: OrderItem[] = [];
        let total = 0;

        for (const item of dto.items) {
          const product = await manager.findOne(this.productRepository.target, {
            where: { id: item.productId },
          });
          if (!product) {
            throw new NotFoundException(`Product ${item.productId} not found`);
          }
          if (product.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for product ${product.name}`);
          }

          product.stock -= item.quantity;
          await manager.save(product);

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

        return manager.save(order);
      });

      // Enqueue job AFTER the transaction commits so the processor works with
      // persisted data. BullMQ persists this job in Redis — if the worker
      // crashes it will be retried automatically (Choreography Saga pattern).
      await this.orderQueue.add(ORDER_JOBS.CREATED, {
        orderId: savedOrder.id,
        userId,
        total: savedOrder.total,
        itemCount: savedOrder.items.length,
      });

      return savedOrder;
    } catch (error) {
       // Saga compensating job: enqueue so the processor notifies the user
      // even if the worker is temporarily down — it will retry.
      await this.orderQueue.add(ORDER_JOBS.FAILED, { userId, reason: (error as Error).message });
      throw error;
    }
  }

  async findByUser(userId: string, query: PaginationQueryDto): Promise<PaginatedResult<Order>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'DESC' } = query;

    const queryBuilder = this.orderRepository.createQueryBuilder('order');
    queryBuilder.leftJoinAndSelect('order.items', 'items');
    queryBuilder.where('order.userId = :userId', { userId });

    const allowedSortFields = ['status', 'total', 'createdAt', 'updatedAt'];
    const orderField =
      sortBy && allowedSortFields.includes(sortBy) ? `order.${sortBy}` : 'order.createdAt';
    const order = sortOrder;

    queryBuilder.orderBy(orderField, order);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
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
