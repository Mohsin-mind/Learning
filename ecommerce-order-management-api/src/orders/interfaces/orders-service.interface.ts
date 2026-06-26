import { Order } from '../entities/order.entity';

export interface IOrdersService {
  create(userId: string, dto: { items: { productId: string; quantity: number }[] }): Promise<Order>;
  findByUser(userId: string): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  updateStatus(id: string, status: string): Promise<Order>;
}

export const ORDERS_SERVICE_TOKEN = Symbol('ORDERS_SERVICE_TOKEN');
