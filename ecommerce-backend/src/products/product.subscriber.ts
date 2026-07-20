import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, SoftRemoveEvent, DataSource } from 'typeorm';
import { Product } from '@/products/entities/product.entity';
import { AlgoliaService } from '@/common/services/algolia.service';
import { ALGOLIA_INDEX } from '@/common/constants/app.constants';

@Injectable()
@EventSubscriber()
export class ProductSubscriber implements EntitySubscriberInterface<Product>, OnApplicationBootstrap {
  private readonly logger = new Logger(ProductSubscriber.name);

  constructor(
    private readonly algolia: AlgoliaService,
    private readonly dataSource: DataSource,
  ) {}

  listenTo() {
    return Product;
  }

  async onApplicationBootstrap(): Promise<void> {
    const existing = await this.algolia.search(ALGOLIA_INDEX.PRODUCTS, '', { hitsPerPage: 1 }).catch(() => null);
    if (existing && (existing.nbHits ?? 0) > 0) return;

    const products = await this.dataSource.manager.find(Product);
    if (products.length === 0) return;

    await Promise.all(
      products.map((p) =>
        this.algolia.saveObject(ALGOLIA_INDEX.PRODUCTS, {
          objectID: p.id,
          name: p.name,
          description: p.description,
          price: Number(p.price),
          stock: p.stock,
        }),
      ),
    );
    this.logger.log(`Backfilled ${products.length} products to Algolia`);
  }

  async afterInsert(event: InsertEvent<Product>): Promise<void> {
    const { id, name, description, price, stock } = event.entity;
    await this.algolia.saveObject(ALGOLIA_INDEX.PRODUCTS, {
      objectID: id,
      name,
      description,
      price: Number(price),
      stock,
    });
    this.logger.log(`Indexed product "${name}" to Algolia`);
  }

  async afterUpdate(event: UpdateEvent<Product>): Promise<void> {
    const entity = event.entity as Product | undefined;
    if (!entity) return;

    const { id, name, description, price, stock } = entity;
    await this.algolia.saveObject(ALGOLIA_INDEX.PRODUCTS, {
      objectID: id,
      name,
      description,
      price: Number(price),
      stock,
    });
    this.logger.log(`Updated Algolia index for "${name}"`);
  }

  async afterSoftRemove(event: SoftRemoveEvent<Product>): Promise<void> {
    const entity = event.entity as Product | undefined;
    if (!entity) return;

    await this.algolia.deleteObject(ALGOLIA_INDEX.PRODUCTS, entity.id);
    this.logger.log(`Removed "${entity.name}" from Algolia`);
  }
}
