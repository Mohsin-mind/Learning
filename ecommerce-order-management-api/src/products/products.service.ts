import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { IProductsService } from './interfaces/products-service.interface';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<Product>> {
    const { page = 1, limit = 10, sortBy, sortOrder = 'DESC', search } = query;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    if (search) {
      queryBuilder.where('product.name ILIKE :search OR product.description ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const allowedSortFields = ['name', 'price', 'stock', 'createdAt', 'updatedAt'];
    const orderField =
      sortBy && allowedSortFields.includes(sortBy) ? `product.${sortBy}` : 'product.createdAt';
    const order = sortOrder;

    queryBuilder.orderBy(orderField, order);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
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
