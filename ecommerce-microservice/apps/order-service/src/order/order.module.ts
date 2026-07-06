import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RMQ_CLIENT_TOKEN } from '@app/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    {
      provide: RMQ_CLIENT_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('rabbitmq.url')!],
            queue: config.get<string>('rabbitmq.queue')!,
            queueOptions: { durable: true },
          },
        }),
    },
  ],
  exports: [OrderService],
})
export class OrderModule {}
