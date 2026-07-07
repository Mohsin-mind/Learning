import { Injectable, Logger } from '@nestjs/common';
import { RmqContext } from '@nestjs/microservices';
import { EVENTS, RMQ_EXCHANGES, RMQ_RETRY, RMQ_ROUTING } from '@app/common';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderCreatedData {
  orderId: string;
  userId: string;
  total: number;
  items: OrderItem[];
  timestamp: string;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);
  private readonly stockDb = new Map<string, number>();
  private readonly processedIds = new Set<string>();

  constructor() {
    this.stockDb.set('prod-1', 100);
    this.stockDb.set('prod-2', 50);
    this.stockDb.set('prod-3', 0);
  }

  async handleOrderCreated(data: OrderCreatedData, context: RmqContext): Promise<void> {
    const channel = context.getChannelRef();
    const message = context.getMessage();

    if (this.processedIds.has(data.orderId)) {
      this.logger.log(`Skipping duplicate order ${data.orderId}`);
      channel.ack(message);
      return;
    }

    try {
      this.logger.log(`Processing order ${data.orderId}`);
      for (const item of data.items) {
        const available = this.stockDb.get(item.productId) ?? 0;
        if (available < item.quantity) {
          throw new Error(
            `Insufficient stock for ${item.productId}: need ${item.quantity}, have ${available}`,
          );
        }
        this.stockDb.set(item.productId, available - item.quantity);
        this.logger.log(
          `Reserved ${item.quantity}x ${item.productId} for order ${data.orderId}`,
        );
      }
      this.processedIds.add(data.orderId);
      channel.ack(message);
    } catch (err) {
      const death = message.properties.headers?.['x-death'];
      const retryCount = Array.isArray(death)
        ? death.reduce((sum: number, d: { count?: number }) => sum + (d.count ?? 0), 0)
        : 0;

      if (retryCount >= RMQ_RETRY.MAX_ATTEMPTS) {
        const content = Buffer.from(
          JSON.stringify({ pattern: EVENTS.ORDER_CREATED, data }),
        );
        // Check publish return — false means channel backpressure; nack to retry rather than lose
        const ok = channel.publish(RMQ_EXCHANGES.DEAD_LETTER, RMQ_ROUTING.DEAD, content, {
          persistent: true,
          headers: {
            'x-retry-count': retryCount,
            'x-final-error': (err as Error).message,
          },
        });
        if (!ok) {
          this.logger.error(
            `DLQ publish backpressure for order ${data.orderId} — nacking to retry`,
          );
          channel.nack(message, false, false);
          return;
        }
        channel.ack(message);
        this.logger.error(
          `Order ${data.orderId} failed after ${retryCount} retries → sent to DLQ`,
        );
        return;
      }

      this.logger.warn(
        `Order ${data.orderId} failed (attempt ${retryCount + 1}/${RMQ_RETRY.MAX_ATTEMPTS}), ` +
          `retry in ${RMQ_RETRY.BACKOFF_MS}ms`,
      );
      channel.nack(message, false, false);
    }
  }

  handleOrderUpdated(
    data: { orderId: string; status: string },
    context: RmqContext,
  ): void {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    this.logger.log(`Order ${data.orderId} updated to status: ${data.status}`);
    channel.ack(message);
  }

  checkStock(
    data: { orderId: string },
    context: RmqContext,
  ): { stockAvailable: boolean } {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    const available = this.stockDb.get('prod-1') ?? 0;
    this.logger.log(`Stock check for order ${data.orderId}: ${available} units available`);
    channel.ack(message);
    return { stockAvailable: available > 0 };
  }
}
