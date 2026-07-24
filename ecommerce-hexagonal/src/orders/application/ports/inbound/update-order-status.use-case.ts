import { OrderStatus } from "../../../../shared/domain/value-objects/order-status.js";
import { Order } from "../../../domain/order.entity.js";

export const UPDATE_ORDER_STATUS_USE_CASE = Symbol("UpdateOrderStatusUseCase");

export interface UpdateOrderStatusUseCase {
  updateStatus(orderId: string, status: OrderStatus): Promise<Order>;
}
