import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface WrappedResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>> {
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
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          data: response,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
