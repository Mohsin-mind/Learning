import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EVENTS, RMQ_CLIENT_TOKEN } from '@app/common';
import { RmqPublisherService } from '../rmq/rmq-publisher.service';
import { lastValueFrom, timeout, catchError, throwError } from 'rxjs';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface OrderEvent {
  orderId: string;
  userId: string;
  total: number;
  items: OrderItem[];
  timestamp: string;
}

@Injectable()
export class OrderService {
  constructor(
    private readonly publisher: RmqPublisherService,
    @Inject(RMQ_CLIENT_TOKEN) private readonly client: ClientProxy,
  ) {}

  async publishOrderCreated(
    event: OrderEvent,
  ): Promise<{ success: boolean; event: string; orderId: string }> {
    await this.publisher.publish(EVENTS.ORDER_CREATED, event);
    return { success: true, event: EVENTS.ORDER_CREATED, orderId: event.orderId };
  }

  async checkStock(orderId: string): Promise<{ stockAvailable: boolean }> {
    const result = await lastValueFrom(
      this.client.send<{ stockAvailable: boolean }>('check_stock', { orderId }).pipe(
        // Without a timeout the HTTP request hangs forever when inventory-service is down
        timeout(5000),
        catchError(() =>
          throwError(() => new ServiceUnavailableException('Inventory service unavailable')),
        ),
      ),
    );
    return result ?? { stockAvailable: false };
  }
}
