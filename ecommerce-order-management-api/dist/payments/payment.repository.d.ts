import { DataSource, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
export declare class PaymentRepository extends Repository<Payment> {
    private readonly dataSource;
    constructor(dataSource: DataSource);
}
