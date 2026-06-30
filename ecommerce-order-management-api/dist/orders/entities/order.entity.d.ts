import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare class Order {
    id: string;
    userId: string;
    user: User;
    status: OrderStatus;
    total: number;
    items: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}
