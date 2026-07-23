import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TypeOrmOrder } from './typeorm-order.entity.js';

@Entity('order_items')
export class TypeOrmOrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  orderId: string;

  @ManyToOne(() => TypeOrmOrder, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'orderId' })
  order: TypeOrmOrder;

  @Column({ type: 'uuid' })
  productId: string;

  @Column()
  productName: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column()
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;
}