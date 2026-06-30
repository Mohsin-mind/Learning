import { Injectable, Logger } from '@nestjs/common';
import { EventSubscriber, EntitySubscriberInterface, UpdateEvent, InsertEvent } from 'typeorm';
import { Product } from '@/products/entities/product.entity';

@Injectable()
@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product> {
  private readonly logger = new Logger(ProductSubscriber.name);

  listenTo() {
    return Product;
  }

  beforeInsert(event: InsertEvent<Product>) {
    this.logger.log(`Inserting product: ${event.entity.name}`);
  }

  beforeUpdate(event: UpdateEvent<Product>) {
    const entity = event.entity as Product | undefined;
    const databaseEntity = event.databaseEntity as Product | undefined;

    if (entity && databaseEntity) {
      const oldStock = databaseEntity.stock;
      const newStock = entity.stock;
      if (oldStock !== newStock) {
        this.logger.log(`Stock changed for "${entity.name}": ${oldStock} -> ${newStock}`);
      }
    }
  }
}
