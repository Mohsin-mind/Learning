import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { OrderSalesSummary } from './entities/order-sales-summary.entity';

@Injectable()
export class OrderSalesSummaryRepository extends Repository<OrderSalesSummary> {
  constructor(private readonly dataSource: DataSource) {
    super(OrderSalesSummary, dataSource.manager);
  }
}
