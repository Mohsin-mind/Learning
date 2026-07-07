import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RMQ_EXCHANGES, RMQ_QUEUES } from '@app/common';

async function setupDLQInfrastructure(url: string) {
  const conn = await amqp.connect(url);
  const channel = await conn.createChannel();
  await channel.assertExchange(RMQ_EXCHANGES.DEAD_LETTER, 'direct', { durable: true });
  await channel.assertQueue(RMQ_QUEUES.DEAD_LETTER, { durable: true });
  await channel.bindQueue(RMQ_QUEUES.DEAD_LETTER, RMQ_EXCHANGES.DEAD_LETTER, RMQ_QUEUES.DEAD_LETTER);
  await channel.close();
  await conn.close();
  console.log(`DLQ infrastructure ready (${RMQ_EXCHANGES.DEAD_LETTER} → ${RMQ_QUEUES.DEAD_LETTER})`);
}

async function bootstrap() {
  const url = process.env.RABBITMQ_URL || `amqp://${process.env.RABBITMQ_USER || 'user'}:${process.env.RABBITMQ_PASS || 'password'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;
  await setupDLQInfrastructure(url);

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmq.url')!],
      queue: configService.get<string>('rabbitmq.queue')!,
      queueOptions: {
        durable: true,
        deadLetterExchange: RMQ_EXCHANGES.DEAD_LETTER,
        deadLetterRoutingKey: RMQ_QUEUES.DEAD_LETTER,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  console.log(`Inventory Service listening on queue "${configService.get<string>('rabbitmq.queue')}"`);
}

bootstrap().catch((err) => {
  console.error('Failed to start inventory service', err);
  process.exit(1);
});
