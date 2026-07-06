import { Module } from '@nestjs/common';
import { SharedConfigModule } from '@app/common';
import { OrderModule } from './order/order.module';

@Module({
  imports: [SharedConfigModule, OrderModule],
})
export class AppModule {}
