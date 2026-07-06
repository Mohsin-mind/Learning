import { Module } from '@nestjs/common';
import { SharedConfigModule } from '@app/common';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [SharedConfigModule, InventoryModule],
})
export class AppModule {}
