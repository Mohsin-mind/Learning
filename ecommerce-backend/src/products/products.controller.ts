import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Cache } from 'cache-manager';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Admin } from '@/common/decorators/admin.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { Public } from '@/common/decorators/public.decorator';
import type { IProductsService } from './interfaces/products-service.interface';
import { PRODUCTS_SERVICE_TOKEN } from './interfaces/products-service.interface';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCTS_SERVICE_TOKEN)
    private readonly productsService: IProductsService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Public()
  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(1 * 60 * 1000) // 1 minute
  @ApiOperation({ summary: 'List all products with pagination, filtering, and sorting' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Admin()
  @Post()
  @ApiOperation({ summary: 'Create a product (admin only)' })
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);
    await this.cacheManager.clear();
    return product;
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (admin only)' })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto) {
    const product = await this.productsService.update(id, dto);
    await this.cacheManager.clear();
    return product;
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.remove(id);
    await this.cacheManager.clear();
    return null;
  }
}
