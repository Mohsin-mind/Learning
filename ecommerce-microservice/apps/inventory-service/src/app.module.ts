import { Module } from '@nestjs/common';
import { SharedConfigModule } from '@app/common';
import { InventoryModule } from './inventory/inventory.module';
import { DeadLetterModule } from './dead-letter/dead-letter.module';

@Module({
  imports: [SharedConfigModule, InventoryModule, DeadLetterModule],
})
export class AppModule {}
