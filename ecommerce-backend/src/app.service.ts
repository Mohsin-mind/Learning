import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Cache } from 'cache-manager';
import { QUEUES } from '@/common/constants/app.constants';
import { PRODUCTS_SERVICE_TOKEN } from '@/products/interfaces/products-service.interface';
import type { IProductsService } from '@/products/interfaces/products-service.interface';

@Injectable()
export class AppService implements OnModuleInit, OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @InjectQueue(QUEUES.ORDERS) private readonly orderQueue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(PRODUCTS_SERVICE_TOKEN) private readonly productsService: IProductsService,
  ) {}

  async onModuleInit() {
    try {
      const redis = await this.orderQueue.client;
      this.logger.log(`BullMQ connected to Redis (status: ${redis.status})`);
    } catch {
      this.logger.warn('Redis / BullMQ not available. Background job processing will be degraded.');
    }
  }

  async onApplicationBootstrap() {
    try {
      const products = await this.productsService.findAll({ page: 1, limit: 10 });
      if (products.data.length > 0) {
        await this.cacheManager.set('/api/v1/products', products, 60_000);
        this.logger.log(`Cache warmed with ${products.data.length} products`);
      }
    } catch (error) {
      this.logger.warn(
        `Cache warmup skipped: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(`Shutting down gracefully (signal: ${signal ?? 'N/A'})`);
  }
}
