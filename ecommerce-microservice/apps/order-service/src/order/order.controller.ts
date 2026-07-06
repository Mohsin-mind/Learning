import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import type { OrderEvent } from './order.service';

@Controller('orders')
export class OrderController {
  constructor(private readonly order: OrderService) {}

  @Post('create')
  async createOrder(@Body() body: OrderEvent) {
    return this.order.publishOrderCreated(body);
  }

  @Get(':id/check-stock')
  async checkStock(@Param('id') orderId: string) {
    return this.order.checkStock(orderId);
  }
}
