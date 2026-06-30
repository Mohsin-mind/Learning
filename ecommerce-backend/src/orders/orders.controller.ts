import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { IOrdersService } from './interfaces/orders-service.interface';
import { ORDERS_SERVICE_TOKEN } from './interfaces/orders-service.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { Admin } from '@/common/decorators/admin.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(ORDERS_SERVICE_TOKEN)
    private readonly ordersService: IOrdersService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an order' })
  create(@CurrentUser() user: User, @Body() dto: CreateOrderDto) {
    return this.ordersService.create(user.id, dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: "List current user's orders with pagination and sorting" })
  findByUser(@CurrentUser() user: User, @Query() query: PaginationQueryDto) {
    return this.ordersService.findByUser(user.id, query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order by ID' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findById(id);
  }

  @Admin()
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status (admin only)' })
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto.status);
  }
}
