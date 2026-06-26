import { Module } from '@nestjs/common';
import { OrderEventListener } from './order-event.listener';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [OrdersModule, ProductsModule],
  providers: [OrderEventListener],
})
export class EventsModule {}
