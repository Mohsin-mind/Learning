import { Expose } from 'class-transformer';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn({ default: 1 })
  version: number;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Expose()
  get inStock(): boolean {
    return this.stock > 0;
  }

  @Expose()
  get formattedPrice(): string {
    return `$${Number(this.price).toFixed(2)}`;
  }
}
