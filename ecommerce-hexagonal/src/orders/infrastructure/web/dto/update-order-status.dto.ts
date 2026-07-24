import { IsEnum } from "class-validator";
import { OrderStatus } from "../../../../shared/domain/value-objects/order-status.js";

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
