import { Module } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from './config/config.module';
import { redisConfig } from './config/redis.config';
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
import { AppService } from './app.service';
import { QUEUES } from '@/common/constants/app.constants';

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
    BullModule.forRootAsync({
      inject: [redisConfig.KEY],
      useFactory: (config: ConfigType<typeof redisConfig>) => ({
        connection: {
          host: config.host,
          port: config.port,
        },
      }),
    }),
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
    BullModule.registerQueue({
      name: QUEUES.ORDERS,
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
