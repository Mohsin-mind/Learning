import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductRepository } from './product.repository';
import { ProductSubscriber } from './product.subscriber';
import { PRODUCTS_SERVICE_TOKEN } from './interfaces/products-service.interface';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: PRODUCTS_SERVICE_TOKEN,
      useClass: ProductsService,
    },
    ProductRepository,
    ProductSubscriber,
  ],
  exports: [PRODUCTS_SERVICE_TOKEN, ProductRepository],
})
export class ProductsModule {}
