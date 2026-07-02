import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { RestoreStockCommand } from './restore-stock.command';
import { StockRestoredEvent } from '../events/stock-restored.event';
import { EventStoreService } from '../event-store/event-store.service';
import { ProductRepository } from '@/products/product.repository';
import { Product } from '@/products/entities/product.entity';

@Injectable()
@CommandHandler(RestoreStockCommand)
export class RestoreStockHandler implements ICommandHandler<RestoreStockCommand> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RestoreStockCommand): Promise<void> {
    const { orderId, items } = command;

    await this.dataSource.transaction(async (manager) => {
      for (const item of items) {
        const product = await manager.findOne(Product, {
          where: { id: item.productId },
        });
        if (product) {
          product.stock += item.quantity;
          await manager.save(product);
        }
      }
    });

    await this.eventStore.append(
      orderId,
      'Order',
      'StockRestored',
      {
        orderId,
        items,
      },
    );

    this.eventBus.publish(new StockRestoredEvent(orderId, items));
  }
}
