import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Order, OrderStatus } from '@/orders/entities/order.entity';
import { OrderItem } from '@/orders/entities/order-item.entity';
import { OrderCreatedEvent } from '../events/order-created.event';
import { PaymentChargedEvent } from '../events/payment-charged.event';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { StockDeductionFailedEvent } from '../events/stock-deduction-failed.event';

@Injectable()
@EventsHandler(OrderCreatedEvent)
export class OrderCreatedProjector implements IEventHandler<OrderCreatedEvent> {
  constructor(private readonly dataSource: DataSource) {}

  async handle(event: OrderCreatedEvent): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(Order, {
        where: { id: event.orderId },
      });

      if (existing) {
        return;
      }

      const order = new Order();
      order.id = event.orderId;
      order.userId = event.userId;
      order.total = event.total;
      order.status = OrderStatus.PENDING;
      order.items = event.items.map((item) => {
        const orderItem = new OrderItem();
        orderItem.order = order;
        orderItem.productId = item.productId;
        orderItem.productName = item.productName;
        orderItem.price = item.price;
        orderItem.quantity = item.quantity;
        return orderItem;
      });

      await manager.save(order);
    });
  }
}

@Injectable()
@EventsHandler(PaymentChargedEvent)
export class PaymentChargedProjector implements IEventHandler<PaymentChargedEvent> {
  constructor(private readonly dataSource: DataSource) {}

  async handle(event: PaymentChargedEvent): Promise<void> {
    await updateOrderStatus(this.dataSource, event.orderId, OrderStatus.CONFIRMED);
  }
}

@Injectable()
@EventsHandler(PaymentFailedEvent)
export class PaymentFailedProjector implements IEventHandler<PaymentFailedEvent> {
  constructor(private readonly dataSource: DataSource) {}

  async handle(event: PaymentFailedEvent): Promise<void> {
    await updateOrderStatus(this.dataSource, event.orderId, OrderStatus.CANCELLED);
  }
}

@Injectable()
@EventsHandler(StockDeductionFailedEvent)
export class StockDeductionFailedProjector implements IEventHandler<StockDeductionFailedEvent> {
  constructor(private readonly dataSource: DataSource) {}

  async handle(event: StockDeductionFailedEvent): Promise<void> {
    await updateOrderStatus(this.dataSource, event.orderId, OrderStatus.CANCELLED);
  }
}

async function updateOrderStatus(
  dataSource: DataSource,
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  await dataSource.getRepository(Order).update({ id: orderId }, { status });
}

export const OrderReadModelProjectors = [
  OrderCreatedProjector,
  PaymentChargedProjector,
  PaymentFailedProjector,
  StockDeductionFailedProjector,
];
