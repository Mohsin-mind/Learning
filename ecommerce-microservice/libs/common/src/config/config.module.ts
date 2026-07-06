import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import appConfig from './app.config';
import rabbitmqConfig from './rabbitmq.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      isGlobal: true,
      load: [appConfig, rabbitmqConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        RABBITMQ_HOST: Joi.string().default('localhost'),
        RABBITMQ_PORT: Joi.number().default(5672),
        RABBITMQ_USER: Joi.string().default('user'),
        RABBITMQ_PASS: Joi.string().default('password'),
        RABBITMQ_VHOST: Joi.string().default('/'),
        RABBITMQ_QUEUE: Joi.string().default('order_events'),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class SharedConfigModule {}
