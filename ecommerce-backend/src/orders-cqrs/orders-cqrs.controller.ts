import { Controller, Post, Get, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateOrderCommand } from './commands/create-order.command';
import { GetOrderQuery } from './queries/get-order.query';
import { EventStoreService } from './event-store/event-store.service';
import { StoredEvent } from './event-store/event.entity';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@/orders/entities/order.entity';

@ApiTags('Orders CQRS')
@Controller('orders-cqrs')
export class OrdersCqrsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventStore: EventStoreService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an order via CQRS' })
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreateOrderDto,
  ): Promise<{ orderId: string }> {
    return this.commandBus.execute(new CreateOrderCommand(user.id, dto.items));
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order from projected shared orders table' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<unknown> {
    return this.queryBus.execute(new GetOrderQuery(id));
  }

  @Get(':id/history')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reconstruct order state from event store' })
  async getHistory(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ state: Record<string, unknown>; events: StoredEvent[] }> {
    const events = await this.eventStore.getEvents(id);
    return { state: this.replay(events), events };
  }

  private replay(events: StoredEvent[]): Record<string, unknown> {
    const state: {
      orderId?: string;
      userId?: string;
      items?: unknown[];
      total?: number;
      status?: OrderStatus;
      stock?: string;
      payment?: string;
      failureReason?: string;
    } = {};

    for (const event of events) {
      switch (event.eventType) {
        case 'OrderCreated':
          state.orderId = event.payload.orderId as string;
          state.userId = event.payload.userId as string;
          state.items = event.payload.items as unknown[];
          state.total = event.payload.total as number;
          state.status = OrderStatus.PENDING;
          break;
        case 'StockDeducted':
          state.stock = 'deducted';
          break;
        case 'StockDeductionFailed':
          state.status = OrderStatus.CANCELLED;
          state.stock = 'failed';
          state.failureReason = event.payload.reason as string;
          break;
        case 'PaymentCharged':
          state.status = OrderStatus.CONFIRMED;
          state.payment = 'charged';
          break;
        case 'PaymentFailed':
          state.status = OrderStatus.CANCELLED;
          state.payment = 'failed';
          state.failureReason = event.payload.reason as string;
          break;
        case 'StockRestored':
          state.stock = 'restored';
          break;
      }
    }

    return state;
  }
}
