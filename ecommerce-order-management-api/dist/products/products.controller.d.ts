import type { Cache } from 'cache-manager';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import type { IProductsService } from './interfaces/products-service.interface';
export declare class ProductsController {
    private readonly productsService;
    private readonly cacheManager;
    constructor(productsService: IProductsService, cacheManager: Cache);
    findAll(query: PaginationQueryDto): any;
    findOne(id: string): any;
    create(dto: CreateProductDto): Promise<any>;
    update(id: string, dto: UpdateProductDto): Promise<any>;
    remove(id: string): Promise<null>;
}
