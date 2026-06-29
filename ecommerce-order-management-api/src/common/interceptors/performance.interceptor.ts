import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

const SLOW_THRESHOLD_MS = 1_000;

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const start = Date.now();

    const logIfSlow = () => {
      const duration = Date.now() - start;
      if (duration > SLOW_THRESHOLD_MS) {
        this.logger.warn(`SLOW REQUEST [${duration}ms] ${request.method} ${request.url}`);
      }
    };

    return next.handle().pipe(
      tap({
        next: logIfSlow,
        error: logIfSlow,
      }),
    );
  }
}
