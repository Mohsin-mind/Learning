import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DeductStockCommand } from './deduct-stock.command';
import { StockDeductedEvent } from '../events/stock-deducted.event';
import { StockDeductionFailedEvent } from '../events/stock-deduction-failed.event';
import { EventStoreService } from '../event-store/event-store.service';
import { ProductRepository } from '@/products/product.repository';
import { Product } from '@/products/entities/product.entity';

@Injectable()
@CommandHandler(DeductStockCommand)
export class DeductStockHandler implements ICommandHandler<DeductStockCommand> {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly dataSource: DataSource,
    private readonly eventStore: EventStoreService,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeductStockCommand): Promise<void> {
    const { orderId, items } = command;

    try {
      await this.dataSource.transaction(async (manager) => {
        for (const item of items) {
          const product = await manager.findOne(Product, {
            where: { id: item.productId },
          });
          if (!product) {
            throw new NotFoundException(`Product ${item.productId} not found`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
          }
          product.stock -= item.quantity;
          await manager.save(product);
        }
      });

      await this.eventStore.append(
        orderId,
        'Order',
        'StockDeducted',
        {
          orderId,
          items,
        },
      );

      this.eventBus.publish(new StockDeductedEvent(orderId, items));
    } catch (error) {
      const reason = (error as Error).message;
      await this.eventStore.append(
        orderId,
        'Order',
        'StockDeductionFailed',
        {
          orderId,
          reason,
        },
      );

      this.eventBus.publish(new StockDeductionFailedEvent(orderId, reason));
    }
  }
}
