import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, RmqContext, RpcException } from '@nestjs/microservices';
import { EVENTS } from '@app/common';

interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface OrderCreatedData {
  orderId: string;
  userId: string;
  total: number;
  items: OrderItem[];
  timestamp: string;
}

@Controller()
export class InventoryService {
  private readonly stockDb = new Map<string, number>();

  constructor() {
    this.stockDb.set('prod-1', 100);
    this.stockDb.set('prod-2', 50);
    this.stockDb.set('prod-3', 0);
  }

  @EventPattern(EVENTS.ORDER_CREATED)
  async handleOrderCreated(data: OrderCreatedData, context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      console.log(`[Inventory] Order created: ${data.orderId}`);
      for (const item of data.items) {
        const available = this.stockDb.get(item.productId) ?? 0;
        if (available < item.quantity) {
          throw new RpcException({
            message: `Insufficient stock for ${item.productId}`,
            orderId: data.orderId,
            productId: item.productId,
          });
        }
        this.stockDb.set(item.productId, available - item.quantity);
        console.log(`[Inventory] Reserved ${item.quantity}x ${item.productId} for order ${data.orderId}`);
      }
      channel.ack(message);
    } catch (err) {
      console.error(`[Inventory] Failed to process order ${data.orderId}`, err);
      channel.nack(message, false, false);
    }
  }

  @EventPattern(EVENTS.ORDER_UPDATED)
  handleOrderUpdated(data: { orderId: string; status: string }, context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    console.log(`[Inventory] Order ${data.orderId} updated to status: ${data.status}`);
    channel.ack(message);
  }

  @MessagePattern('check_stock')
  checkStock(data: { orderId: string }): { stockAvailable: boolean } {
    const available = this.stockDb.get('prod-1') ?? 0;
    console.log(`[Inventory] Stock check for order ${data.orderId}: ${available} units available`);
    return { stockAvailable: available > 0 };
  }
}
