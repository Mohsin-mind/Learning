import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderRepository } from './order.repository';
import { ORDERS_SERVICE_TOKEN } from './interfaces/orders-service.interface';
import { ProductsModule } from '../products/products.module';
import { QUEUES } from '../common/constants/app.constants';

@Module({
  imports: [ProductsModule, BullModule.registerQueue({ name: QUEUES.ORDERS })],
  controllers: [OrdersController],
  providers: [
    {
      provide: ORDERS_SERVICE_TOKEN,
      useClass: OrdersService,
    },
    OrderRepository,
  ],
  exports: [ORDERS_SERVICE_TOKEN, OrderRepository],
})
export class OrdersModule {}
