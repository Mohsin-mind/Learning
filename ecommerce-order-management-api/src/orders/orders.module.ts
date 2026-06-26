import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderRepository } from './order.repository';
import { ORDERS_SERVICE_TOKEN } from './interfaces/orders-service.interface';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [ProductsModule],
  controllers: [OrdersController],
  providers: [
    {
      provide: ORDERS_SERVICE_TOKEN,
      useClass: OrdersService,
    },
    OrderRepository,
  ],
  exports: [ORDERS_SERVICE_TOKEN],
})
export class OrdersModule {}
