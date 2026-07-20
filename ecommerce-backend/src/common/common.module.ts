import {
  ClassSerializerInterceptor,
  Global,
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './interceptors/response-transform.interceptor';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { APP_VERSION_TOKEN } from './constants/di-tokens.constant';
import { RequestIdMiddleware } from './middleware/request-id.middleware';
import { RequestContextModule } from './context/request-context.module';
import { CacheStampedeService } from './services/cache-stampede.service';
import { CdcListenerService } from './services/cdc-listener.service';
import { AlgoliaService } from './services/algolia.service';

@Global()
@Module({
  imports: [RequestContextModule],
  providers: [
    CacheStampedeService,
    CdcListenerService,
    AlgoliaService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
      useClass: PerformanceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (reflector: Reflector) => new ClassSerializerInterceptor(reflector),
      inject: [Reflector],
    },
    {
      provide: APP_VERSION_TOKEN,
      useValue: '1.0.0',
    },
  ],
  exports: [APP_VERSION_TOKEN, CacheStampedeService, CdcListenerService, AlgoliaService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
