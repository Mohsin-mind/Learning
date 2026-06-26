import { ClassSerializerInterceptor, Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { randomUUID } from 'node:crypto';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { REQUEST_ID_TOKEN, APP_VERSION_TOKEN } from './constants/di-tokens.constant';

@Global()
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: REQUEST_ID_TOKEN,
      useFactory: () => () => randomUUID(),
    },
    {
      provide: APP_VERSION_TOKEN,
      useValue: '1.0.0',
    },
  ],
  exports: [REQUEST_ID_TOKEN, APP_VERSION_TOKEN],
})
export class CommonModule {}
