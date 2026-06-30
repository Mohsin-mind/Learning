import { DataSource, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
export declare class OrderRepository extends Repository<Order> {
    private readonly dataSource;
    constructor(dataSource: DataSource);
}
