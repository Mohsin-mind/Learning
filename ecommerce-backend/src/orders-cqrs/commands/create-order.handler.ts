import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOrderCommand } from './create-order.command';
import { OrderAggregate } from '../aggregates/order.aggregate';
import { OrderCreatedEvent } from '../events/order-created.event';
import { EventStoreService } from '../event-store/event-store.service';
import { ProductRepository } from '@/products/product.repository';

@Injectable()
@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateOrderCommand): Promise<{ orderId: string }> {
    const { userId, items } = command;

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let total = 0;
    const orderItems: {
      productId: string;
      productName: string;
      price: number;
      quantity: number;
    }[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${product.name}`);
      }

      const price = Number(product.price);
      total += price * item.quantity;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        price,
        quantity: item.quantity,
      });
    }

    const aggregate = new OrderAggregate();
    aggregate.create(userId, orderItems, total);

    const [event] = aggregate.getUncommittedEvents() as [OrderCreatedEvent];

    await this.eventStore.append(
      event.orderId,
      'Order',
      'OrderCreated',
      {
        orderId: event.orderId,
        userId: event.userId,
        items: event.items,
        total: event.total,
      },
    );

    this.eventBus.publish(event);
    aggregate.commit();

    return { orderId: event.orderId };
  }
}
