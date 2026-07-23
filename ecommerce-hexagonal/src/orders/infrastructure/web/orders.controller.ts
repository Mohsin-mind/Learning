import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  Inject,
  ParseUUIDPipe,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import type {
  CreateOrderUseCase,
} from '../../application/ports/inbound/create-order.use-case.js';
import {
  CREATE_ORDER_USE_CASE,
} from '../../application/ports/inbound/create-order.use-case.js';
import type {
  UpdateOrderStatusUseCase,
} from '../../application/ports/inbound/update-order-status.use-case.js';
import {
  UPDATE_ORDER_STATUS_USE_CASE,
} from '../../application/ports/inbound/update-order-status.use-case.js';
import type {
  GetOrderQuery,
} from '../../application/ports/inbound/get-order.query.js';
import {
  GET_ORDER_QUERY,
} from '../../application/ports/inbound/get-order.query.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(CREATE_ORDER_USE_CASE)
    private readonly createOrderCase: CreateOrderUseCase,
    @Inject(UPDATE_ORDER_STATUS_USE_CASE)
    private readonly updateStatusCase: UpdateOrderStatusUseCase,
    @Inject(GET_ORDER_QUERY)
    private readonly getOrderQuery: GetOrderQuery,
  ) {}

  @Post()
  async create(@Body() dto: CreateOrderDto) {
    try {
      const userId = '00000000-0000-0000-0000-000000000001';
      return await this.createOrderCase.execute(dto, userId);
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new ConflictException(err.message);
      }
      throw err;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const order = await this.getOrderQuery.getById(id);
    if (!order) throw new NotFoundException(`Order ${id} not found`);
    return order;
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    try {
      return await this.updateStatusCase.updateStatus(id, dto.status);
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new ConflictException(err.message);
      }
      throw err;
    }
  }
}