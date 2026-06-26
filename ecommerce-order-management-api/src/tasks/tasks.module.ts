import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { OrderRepository } from '../orders/order.repository';

@Module({
  providers: [TasksService, OrderRepository],
})
export class TasksModule {}
