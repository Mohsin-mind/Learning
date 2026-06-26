import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { IProductsService } from './interfaces/products-service.interface';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findById(id: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { id } });
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.remove(product);
  }
}
