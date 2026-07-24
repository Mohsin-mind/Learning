import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuid } from "uuid";
import { Order } from "../../domain/order.entity.js";
import { OrderItem } from "../../domain/order-item.entity.js";
import { Money } from "../../../shared/domain/value-objects/money.js";
import { OrderStatus } from "../../../shared/domain/value-objects/order-status.js";
import type { CreateOrderUseCase } from "../ports/inbound/create-order.use-case.js";
import { CREATE_ORDER_USE_CASE } from "../ports/inbound/create-order.use-case.js";
import type { UpdateOrderStatusUseCase } from "../ports/inbound/update-order-status.use-case.js";
import { UPDATE_ORDER_STATUS_USE_CASE } from "../ports/inbound/update-order-status.use-case.js";
import type { GetOrderQuery } from "../ports/inbound/get-order.query.js";
import { GET_ORDER_QUERY } from "../ports/inbound/get-order.query.js";
import type { OrderRepository } from "../ports/outbound/order-repository.port.js";
import { ORDER_REPOSITORY } from "../ports/outbound/order-repository.port.js";
import type { OrderProductRepository } from "../ports/outbound/product-repository.port.js";
import { ORDER_PRODUCT_REPOSITORY } from "../ports/outbound/product-repository.port.js";
import type { PaymentGateway } from "../ports/outbound/payment-gateway.port.js";
import { PAYMENT_GATEWAY } from "../ports/outbound/payment-gateway.port.js";
import type { CreateOrderDto } from "../../infrastructure/web/dto/create-order.dto.js";

@Injectable()
export class OrderService
  implements CreateOrderUseCase, UpdateOrderStatusUseCase, GetOrderQuery
{
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepo: OrderRepository,
    @Inject(ORDER_PRODUCT_REPOSITORY)
    private readonly productRepo: OrderProductRepository,
    @Inject(PAYMENT_GATEWAY)
    private readonly paymentGateway: PaymentGateway,
  ) {}

  async execute(dto: CreateOrderDto, userId: string): Promise<Order> {
    const items: OrderItem[] = [];

    for (const item of dto.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${product.name}`);
      }
      items.push(
        new OrderItem(
          product.id,
          product.name,
          new Money(product.price),
          item.quantity,
        ),
      );
      await this.productRepo.updateStock(
        product.id,
        product.stock - item.quantity,
        product.version,
      );
    }

    const order = Order.create(uuid(), userId, items);

    const payment = await this.paymentGateway.charge(
      order.id,
      order.total.amount,
    );
    if (payment.success) {
      order.changeStatus(OrderStatus.CONFIRMED);
    }

    await this.orderRepo.save(order);
    return order;
  }

  async updateStatus(orderId: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderRepo.findById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    order.changeStatus(status);
    await this.orderRepo.save(order);
    return order;
  }

  async getById(orderId: string): Promise<Order | null> {
    return this.orderRepo.findById(orderId);
  }
}
