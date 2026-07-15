import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardNoteRepository } from './dashboard-note.repository';
import { OrdersModule } from '@/orders/orders.module';
import { DASHBOARD_SERVICE_TOKEN } from './interfaces/dashboard-service.interface';

@Module({
  imports: [OrdersModule],
  controllers: [DashboardController],
  providers: [
    {
      provide: DASHBOARD_SERVICE_TOKEN,
      useClass: DashboardService,
    },
    DashboardNoteRepository,
  ],
})
export class DashboardModule {}
