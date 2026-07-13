import { Order } from '@/orders/entities/order.entity';
import { OrderSalesSummary } from '@/orders/entities/order-sales-summary.entity';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

export interface IOrdersService {
  create(userId: string, dto: { items: { productId: string; quantity: number }[] }): Promise<Order>;
  findByUser(userId: string, query: PaginationQueryDto): Promise<PaginatedResult<Order>>;
  findById(id: string): Promise<Order | null>;
  updateStatus(id: string, status: string): Promise<Order>;
  getSalesSummary(): Promise<OrderSalesSummary[]>;
}

export const ORDERS_SERVICE_TOKEN = Symbol('ORDERS_SERVICE_TOKEN');
