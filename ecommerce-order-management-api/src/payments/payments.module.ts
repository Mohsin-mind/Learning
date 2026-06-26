import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentRepository } from './payment.repository';
import { OrderRepository } from '../orders/order.repository';
import { PAYMENTS_SERVICE_TOKEN } from './interfaces/payments-service.interface';

@Module({
  controllers: [PaymentsController],
  providers: [
    {
      provide: PAYMENTS_SERVICE_TOKEN,
      useClass: PaymentsService,
    },
    PaymentRepository,
    OrderRepository,
  ],
  exports: [PAYMENTS_SERVICE_TOKEN],
})
export class PaymentsModule {}
