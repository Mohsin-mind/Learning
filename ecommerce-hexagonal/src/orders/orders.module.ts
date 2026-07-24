import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CqrsModule } from "@nestjs/cqrs";
import { TypeOrmOrder } from "./infrastructure/persistence/typeorm-order.entity.js";
import { TypeOrmOrderItem } from "./infrastructure/persistence/typeorm-order-item.entity.js";
import { TypeOrmOrderRepository } from "./infrastructure/persistence/typeorm-order.repository.js";
import { TypeOrmOrderProductRepository } from "./infrastructure/persistence/typeorm-product.repository.js";
import { StripePaymentAdapter } from "./infrastructure/payment/stripe-payment.adapter.js";
import { OrdersController } from "./infrastructure/web/orders.controller.js";
import { OrderService } from "./application/services/order.service.js";
import { ORDER_REPOSITORY } from "./application/ports/outbound/order-repository.port.js";
import { ORDER_PRODUCT_REPOSITORY } from "./application/ports/outbound/product-repository.port.js";
import { PAYMENT_GATEWAY } from "./application/ports/outbound/payment-gateway.port.js";
import { CREATE_ORDER_USE_CASE } from "./application/ports/inbound/create-order.use-case.js";
import { UPDATE_ORDER_STATUS_USE_CASE } from "./application/ports/inbound/update-order-status.use-case.js";
import { GET_ORDER_QUERY } from "./application/ports/inbound/get-order.query.js";
import { TypeOrmProduct } from "../products/infrastructure/persistence/typeorm-product.entity.js";

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([TypeOrmOrder, TypeOrmOrderItem, TypeOrmProduct]),
  ],
  controllers: [OrdersController],
  providers: [
    OrderService,
    { provide: ORDER_REPOSITORY, useClass: TypeOrmOrderRepository },
    {
      provide: ORDER_PRODUCT_REPOSITORY,
      useClass: TypeOrmOrderProductRepository,
    },
    { provide: PAYMENT_GATEWAY, useClass: StripePaymentAdapter },
    { provide: CREATE_ORDER_USE_CASE, useExisting: OrderService },
    { provide: UPDATE_ORDER_STATUS_USE_CASE, useExisting: OrderService },
    { provide: GET_ORDER_QUERY, useExisting: OrderService },
  ],
})
export class OrdersModule {}
