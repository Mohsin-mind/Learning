import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RMQ_CLIENT_TOKEN, RMQ_EXCHANGES } from '@app/common';
import { RmqPublisherService } from '../rmq/rmq-publisher.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [
    OrderService,
    RmqPublisherService,
    {
      provide: RMQ_CLIENT_TOKEN,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('rabbitmq.url')!],
            queue: config.get<string>('rabbitmq.queue')!,
            // Args MUST match setupInfrastructure() in inventory-service/main.ts exactly.
            // RabbitMQ rejects re-declarations with different arguments (PRECONDITION_FAILED 406).
            queueOptions: {
              durable: true,
              arguments: {
                'x-dead-letter-exchange': RMQ_EXCHANGES.DEAD_LETTER,
              },
            },
          },
        }),
    },
  ],
  exports: [OrderService],
})
export class OrderModule {}
