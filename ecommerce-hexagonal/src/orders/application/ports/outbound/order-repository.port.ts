import { Order } from "../../../domain/order.entity.js";

export const ORDER_REPOSITORY = Symbol("OrderRepository");

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  findByUser(userId: string): Promise<Order[]>;
}
