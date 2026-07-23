import { Order } from '../../../domain/order.entity.js';

export const GET_ORDER_QUERY = Symbol('GetOrderQuery');

export interface GetOrderQuery {
  getById(orderId: string): Promise<Order | null>;
}