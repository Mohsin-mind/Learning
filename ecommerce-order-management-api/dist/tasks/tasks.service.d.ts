import { OrderRepository } from '../orders/order.repository';
export declare class TasksService {
    private readonly orderRepository;
    private readonly logger;
    constructor(orderRepository: OrderRepository);
    cleanStaleOrders(): Promise<void>;
}
