import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { FilesModule } from './files/files.module';
import { PaymentsModule } from './payments/payments.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    CacheModule.register({ ttl: 60_000, max: 100 }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    CommonModule,
    HealthModule,
    ProductsModule,
    OrdersModule,
    FilesModule,
    PaymentsModule,
    TasksModule,
  ],
})
export class AppModule {}
