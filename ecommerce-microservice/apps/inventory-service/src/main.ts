import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>('rabbitmq.url')!],
      queue: configService.get<string>('rabbitmq.queue')!,
      queueOptions: { durable: true },
      noAck: true,
    },
  });

  await app.startAllMicroservices();
  console.log(`Inventory Service listening on queue "${configService.get<string>('rabbitmq.queue')}"`);
}

bootstrap();
