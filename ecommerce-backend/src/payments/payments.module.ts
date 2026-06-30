import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './payment.repository';
import { PAYMENTS_SERVICE_TOKEN } from './interfaces/payments-service.interface';
import { OrdersModule } from '@/orders/orders.module';
import { QUEUES } from '@/common/constants/app.constants';

@Module({
  imports: [OrdersModule, BullModule.registerQueue({ name: QUEUES.ORDERS })],
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENTS_SERVICE_TOKEN,
      useClass: PaymentsService,
    },
    PaymentRepository,
  ],
  exports: [PAYMENTS_SERVICE_TOKEN],
})
export class PaymentsModule {}
