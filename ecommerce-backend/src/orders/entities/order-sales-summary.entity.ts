import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('order_sales_summary')
export class OrderSalesSummary {
  @PrimaryColumn()
  orderDate: Date;

  @Column()
  totalOrders: number;

  @Column()
  totalRevenue: number;

  @Column()
  avgOrderValue: number;
}
