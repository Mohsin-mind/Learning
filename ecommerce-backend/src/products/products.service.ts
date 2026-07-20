import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { IProductsService } from './interfaces/products-service.interface';
import { AlgoliaService } from '@/common/services/algolia.service';
import { ALGOLIA_INDEX } from '@/common/constants/app.constants';
import type { Hit } from 'algoliasearch';

@Injectable()
export class ProductsService implements IProductsService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly algolia: AlgoliaService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    const savedProduct = await this.productRepository.save(product);
    await this.indexProduct(savedProduct);
    return savedProduct;
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
    const savedProduct = await this.productRepository.save(product);
    await this.indexProduct(savedProduct);
    return savedProduct;
  }

  async searchAlgolia(
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Product>> {
    const result = await this.algolia.search(ALGOLIA_INDEX.PRODUCTS, query, {
      page: page - 1,
      hitsPerPage: limit,
    });

    const total = result.nbHits ?? 0;
    const totalPages = Math.ceil(total / limit);

    if (total === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    const ids = (result.hits as Hit[] | undefined)?.map((h) => h.objectID).filter(Boolean) ?? [];

    if (ids.length === 0) {
      return {
        data: [],
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

    const products = await this.productRepository
      .createQueryBuilder('product')
      .where('product.id IN (:...ids)', { ids })
      .getMany();

    const productMap = new Map(products.map((p) => [p.id, p]));
    const data = ids.map((id) => productMap.get(id)).filter(Boolean) as Product[];

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

  async remove(id: string): Promise<void> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.softRemove(product);
    await this.algolia.deleteObject(ALGOLIA_INDEX.PRODUCTS, product.id);
  }

  private async indexProduct(product: Product): Promise<void> {
    await this.algolia.saveObject(ALGOLIA_INDEX.PRODUCTS, {
      objectID: product.id,
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      inStock: product.inStock,
      createdAt: product.createdAt?.toISOString(),
      updatedAt: product.updatedAt?.toISOString(),
    });
  }
}
