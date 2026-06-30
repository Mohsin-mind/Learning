import { Product } from './entities/product.entity';
import { ProductRepository } from './product.repository';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { IProductsService } from './interfaces/products-service.interface';
export declare class ProductsService implements IProductsService {
    private readonly productRepository;
    constructor(productRepository: ProductRepository);
    create(dto: CreateProductDto): Promise<Product>;
    findAll(query: PaginationQueryDto): Promise<PaginatedResult<Product>>;
    findById(id: string): Promise<Product | null>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<void>;
}
