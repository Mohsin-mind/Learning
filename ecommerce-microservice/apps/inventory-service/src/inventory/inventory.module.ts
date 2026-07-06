import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';

@Module({
  controllers: [InventoryService],
})
export class InventoryModule {}
