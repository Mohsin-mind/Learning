import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmProduct } from './infrastructure/persistence/typeorm-product.entity.js';
import { TypeOrmProductRepository } from './infrastructure/persistence/typeorm-product.repository.js';
import { PRODUCT_REPOSITORY } from './application/ports/outbound/product-repository.port.js';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmProduct])],
  providers: [
    { provide: PRODUCT_REPOSITORY, useClass: TypeOrmProductRepository },
  ],
  exports: [PRODUCT_REPOSITORY],
})
export class ProductsModule {}