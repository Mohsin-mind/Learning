import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LessThan } from 'typeorm';
import { OrderRepository } from '../orders/order.repository';
import { OrderStatus } from '../orders/entities/order.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanStaleOrders() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const staleOrders = await this.orderRepository.find({
      where: {
        status: OrderStatus.CANCELLED,
        createdAt: LessThan(thirtyDaysAgo),
      },
    });

    if (staleOrders.length > 0) {
      await this.orderRepository.remove(staleOrders);
      this.logger.log(`Cleaned ${staleOrders.length} stale cancelled orders`);
    }
  }
}
