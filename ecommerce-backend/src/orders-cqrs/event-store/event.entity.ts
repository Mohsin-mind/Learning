import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('event_store')
@Index(['aggregateId', 'version'], { unique: true })
export class StoredEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'aggregate_id' })
  aggregateId: string;

  @Column({ name: 'aggregate_type' })
  aggregateType: string;

  @Column({ name: 'event_type' })
  eventType: string;

  @Column('jsonb')
  payload: Record<string, unknown>;

  @Column({ type: 'int' })
  version: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
