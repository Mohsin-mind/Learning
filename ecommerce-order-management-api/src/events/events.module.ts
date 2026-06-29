import { Module } from '@nestjs/common';
import { OrderEventListener } from './order-event.listener';

@Module({
  providers: [OrderEventListener],
})
export class EventsModule {}
