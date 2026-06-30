import type { IOrdersService } from './interfaces/orders-service.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { User } from '../users/entities/user.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: IOrdersService);
    create(user: User, dto: CreateOrderDto): any;
    findByUser(user: User, query: PaginationQueryDto): any;
    findOne(user: User, id: string): any;
    updateStatus(id: string, dto: UpdateOrderStatusDto): any;
}
