import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { TypeOrmOrderItem } from './typeorm-order-item.entity.js';

export enum OrmOrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class TypeOrmOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({
    type: 'enum',
    enum: OrmOrderStatus,
    default: OrmOrderStatus.PENDING,
  })
  status: OrmOrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @OneToMany(() => TypeOrmOrderItem, (item) => item.order, { cascade: true })
  @JoinColumn()
  items: TypeOrmOrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}