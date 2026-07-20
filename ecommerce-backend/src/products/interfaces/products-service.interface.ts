import { Product } from '@/products/entities/product.entity';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { UpdateProductDto } from '@/products/dto/update-product.dto';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export interface IProductsService {
  create(dto: CreateProductDto): Promise<Product>;
  findAll(query: PaginationQueryDto): Promise<PaginatedResult<Product>>;
  findById(id: string): Promise<Product | null>;
  update(id: string, dto: UpdateProductDto): Promise<Product>;
  remove(id: string): Promise<void>;
  searchAlgolia(query: string, page?: number, limit?: number): Promise<PaginatedResult<Product>>;
}

export const PRODUCTS_SERVICE_TOKEN = Symbol('PRODUCTS_SERVICE_TOKEN');
