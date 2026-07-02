import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { OrdersCqrsController } from './orders-cqrs.controller';
import { EventStoreModule } from './event-store/event-store.module';
import { OrderSaga } from './sagas/order.saga';
import { CreateOrderHandler } from './commands/create-order.handler';
import { DeductStockHandler } from './commands/deduct-stock.handler';
import { ChargePaymentHandler } from './commands/charge-payment.handler';
import { RestoreStockHandler } from './commands/restore-stock.handler';
import { GetOrderHandler } from './queries/get-order.handler';
import { ChargePaymentProcessor } from './processors/charge-payment.processor';
import { OrderReadModelProjectors } from './projections/order-read-model.projector';
import { ProductsModule } from '@/products/products.module';
import { OrdersModule } from '@/orders/orders.module';
import { QUEUES } from '@/common/constants/app.constants';

@Module({
  imports: [
    CqrsModule,
    EventStoreModule,
    BullModule.registerQueue({ name: QUEUES.ORDERS_CQRS }),
    ProductsModule,
    OrdersModule,
  ],
  controllers: [OrdersCqrsController],
  providers: [
    CreateOrderHandler,
    DeductStockHandler,
    ChargePaymentHandler,
    RestoreStockHandler,
    GetOrderHandler,
    OrderSaga,
    ...OrderReadModelProjectors,
    ChargePaymentProcessor,
  ],
})
export class OrdersCqrsModule {}
