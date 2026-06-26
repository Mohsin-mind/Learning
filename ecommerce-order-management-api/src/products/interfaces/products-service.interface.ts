import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

export interface IProductsService {
  create(dto: CreateProductDto): Promise<Product>;
  findAll(): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  update(id: string, dto: UpdateProductDto): Promise<Product>;
  remove(id: string): Promise<void>;
}

export const PRODUCTS_SERVICE_TOKEN = Symbol('PRODUCTS_SERVICE_TOKEN');
