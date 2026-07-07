import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RMQ_EXCHANGES, RMQ_QUEUES, RMQ_RETRY, RMQ_ROUTING } from '@app/common';

/**
 * Assert all RabbitMQ topology once at startup.
 * This is the single source of truth for exchange/queue declarations —
 * connectMicroservice() must NOT re-declare queue arguments to avoid
 * "PRECONDITION_FAILED — inequivalent arg" channel errors.
 */
async function setupInfrastructure(url: string) {
  const conn = await amqp.connect(url);
  const channel = await conn.createChannel();

  // Exchanges
  await channel.assertExchange(RMQ_EXCHANGES.ORDERS, 'topic', { durable: true });
  await channel.assertExchange(RMQ_EXCHANGES.DEAD_LETTER, 'topic', { durable: true });
  await channel.assertExchange(RMQ_EXCHANGES.REDELIVER, 'direct', { durable: true });

  // Main queue — failed nacks go to orders.dlx → retry_queue → back here.
  // NOTE: x-dead-letter-exchange MUST match the arg in connectMicroservice() below;
  //       RabbitMQ allows idempotent re-declarations only when args are identical.
  //       x-message-ttl is intentionally omitted here (TTL lives on retry_queue only).
  await channel.assertQueue(RMQ_QUEUES.ORDER_EVENTS, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': RMQ_EXCHANGES.DEAD_LETTER,
    },
  });

  // Retry queue — holds nacked messages for BACKOFF_MS then re-delivers via REDELIVER exchange
  await channel.assertQueue(RMQ_QUEUES.RETRY, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': RMQ_EXCHANGES.REDELIVER,
      'x-dead-letter-routing-key': RMQ_QUEUES.ORDER_EVENTS,
      'x-message-ttl': RMQ_RETRY.BACKOFF_MS,
    },
  });

  // Dead-letter queue — terminal failures
  await channel.assertQueue(RMQ_QUEUES.DEAD_LETTER, { durable: true });

  // Bindings
  await channel.bindQueue(RMQ_QUEUES.ORDER_EVENTS, RMQ_EXCHANGES.ORDERS, RMQ_ROUTING.EVENT_PATTERN);
  await channel.bindQueue(RMQ_QUEUES.RETRY, RMQ_EXCHANGES.DEAD_LETTER, RMQ_ROUTING.EVENT_PATTERN);
  await channel.bindQueue(RMQ_QUEUES.DEAD_LETTER, RMQ_EXCHANGES.DEAD_LETTER, RMQ_ROUTING.DEAD);
  await channel.bindQueue(RMQ_QUEUES.ORDER_EVENTS, RMQ_EXCHANGES.REDELIVER, RMQ_QUEUES.ORDER_EVENTS);

  await channel.close();
  await conn.close();
  console.log('[Infrastructure] Exchanges, queues, and bindings asserted successfully');
}

async function bootstrap() {
  const url =
    process.env.RABBITMQ_URL ||
    `amqp://${process.env.RABBITMQ_USER || 'user'}:${process.env.RABBITMQ_PASS || 'password'}` +
      `@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;

  // Non-fatal: if queues already exist with correct args this is a no-op;
  // if RMQ is down we still try to start — the microservice connection will surface the real error.
  try {
    await setupInfrastructure(url);
  } catch (err) {
    console.error('[Infrastructure] Setup failed (non-fatal — queues may already exist):', (err as Error).message);
  }

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmq.url')!],
      queue: configService.get<string>('rabbitmq.queue')!,
      // MUST match setupInfrastructure() exactly — RabbitMQ rejects re-declarations
      // with different arguments (PRECONDITION_FAILED 406).
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': RMQ_EXCHANGES.DEAD_LETTER,
        },
      },
      noAck: false,
      prefetchCount: 1,
    },
  });

  await app.startAllMicroservices();
  console.log(`Inventory Service listening on queue "${configService.get<string>('rabbitmq.queue')}"`);
}

bootstrap().catch((err) => {
  console.error('Failed to start inventory service', err);
  process.exit(1);
});
