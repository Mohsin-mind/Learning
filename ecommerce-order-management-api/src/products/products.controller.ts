import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Admin } from '../common/decorators/admin.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { Public } from '../common/decorators/public.decorator';
import type { IProductsService } from './interfaces/products-service.interface';
import { PRODUCTS_SERVICE_TOKEN } from './interfaces/products-service.interface';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCTS_SERVICE_TOKEN)
    private readonly productsService: IProductsService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all products with pagination, filtering, and sorting' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.productsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }

  @Admin()
  @Post()
  @ApiOperation({ summary: 'Create a product (admin only)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Admin()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Admin()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product (admin only)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
