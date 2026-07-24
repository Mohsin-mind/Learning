import type { CreateOrderDto } from "../../../infrastructure/web/dto/create-order.dto.js";
import { Order } from "../../../domain/order.entity.js";

export const CREATE_ORDER_USE_CASE = Symbol("CreateOrderUseCase");

export interface CreateOrderUseCase {
  execute(dto: CreateOrderDto, userId: string): Promise<Order>;
}
