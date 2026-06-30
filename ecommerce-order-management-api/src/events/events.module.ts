import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { OrderEventsProcessor } from './order-events.processor';
import { QUEUES } from '../common/constants/app.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QUEUES.ORDERS,
    }),
  ],
  providers: [OrderEventsProcessor],
})
export class EventsModule {}
