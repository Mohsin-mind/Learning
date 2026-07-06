import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EVENTS, RMQ_CLIENT_TOKEN } from '@app/common';
import { lastValueFrom } from 'rxjs';

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
  constructor(@Inject(RMQ_CLIENT_TOKEN) private readonly client: ClientProxy) {}

  async publishOrderCreated(event: OrderEvent): Promise<{ success: boolean; event: string; orderId: string }> {
    await lastValueFrom(this.client.emit(EVENTS.ORDER_CREATED, event));
    return { success: true, event: EVENTS.ORDER_CREATED, orderId: event.orderId };
  }

  async checkStock(orderId: string): Promise<{ stockAvailable: boolean }> {
    const result = await lastValueFrom(
      this.client.send<{ stockAvailable: boolean }>('check_stock', { orderId }),
    );
    return result ?? { stockAvailable: false };
  }
}
