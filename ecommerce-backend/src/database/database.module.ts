import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { databaseConfig } from '@/config/database.config';
import { ProductSubscriber } from './subscribers/product.subscriber';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => ({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        subscribers: [ProductSubscriber],
        synchronize: config.synchronize,
        logging: config.logging,
      }),
    }),
  ],
  providers: [ProductSubscriber],
})
export class DatabaseModule {}
