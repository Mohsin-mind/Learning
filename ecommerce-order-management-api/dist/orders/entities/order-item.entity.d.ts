import { Order } from './order.entity';
export declare class OrderItem {
    id: string;
    orderId: string;
    order: Order;
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    createdAt: Date;
}
