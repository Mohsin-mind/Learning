import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoredEvent } from './event.entity';
import { EventStoreService } from './event-store.service';

@Module({
  imports: [TypeOrmModule.forFeature([StoredEvent])],
  providers: [EventStoreService],
  exports: [EventStoreService],
})
export class EventStoreModule {}
