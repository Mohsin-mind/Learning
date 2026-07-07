import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { EVENTS } from '@app/common';
import { InventoryService, OrderCreatedData } from './inventory.service';

@Controller()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @EventPattern(EVENTS.ORDER_CREATED)
  async handleOrderCreated(
    @Payload() data: OrderCreatedData,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    return this.inventoryService.handleOrderCreated(data, context);
  }

  @EventPattern(EVENTS.ORDER_UPDATED)
  handleOrderUpdated(
    @Payload() data: { orderId: string; status: string },
    @Ctx() context: RmqContext,
  ): void {
    return this.inventoryService.handleOrderUpdated(data, context);
  }

  @MessagePattern('check_stock')
  checkStock(
    @Payload() data: { orderId: string },
    @Ctx() context: RmqContext,
  ): { stockAvailable: boolean } {
    return this.inventoryService.checkStock(data, context);
  }
}
