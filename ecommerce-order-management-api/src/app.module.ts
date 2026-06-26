import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
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
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        ttl: configService.get('cache.ttl', 60_000),
        max: configService.get('cache.max', 100),
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
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
    EventsModule,
    NotificationsModule.register({
      provider: 'email',
      apiKey: process.env.NOTIFICATIONS_API_KEY || 'test-api-key',
      from: 'noreply@example.com',
    }),
  ],
})
export class AppModule {}
