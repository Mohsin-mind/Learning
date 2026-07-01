import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { QUEUES } from '@/common/constants/app.constants';

@Module({
  imports: [TerminusModule, BullModule.registerQueue({ name: QUEUES.ORDERS })],
  controllers: [HealthController],
})
export class HealthModule {}
