import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { RequestContextService } from '../context/request-context.service';

export interface WrappedResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  constructor(private readonly contextService: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>> {
    const requestId = this.contextService.get('requestId');

    return next.handle().pipe(
      map((response) => {
        const isPaginated =
          response &&
          typeof response === 'object' &&
          'data' in (response as Record<string, unknown>) &&
          'meta' in (response as Record<string, unknown>);

        if (isPaginated) {
          const paginated = response as unknown as {
            data: T;
            meta: Record<string, unknown>;
          };
          return {
            success: true,
            data: paginated.data,
            meta: paginated.meta,
            requestId,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: response,
          requestId,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
