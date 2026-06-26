import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Request } from 'express';
import { Observable, map } from 'rxjs';

export interface WrappedResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  requestId?: string;
  timestamp: string;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = this.getRequestId(request);

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

  private getRequestId(request: Request): string | undefined {
    const requestId = request.headers['x-request-id'];

    if (Array.isArray(requestId)) {
      return requestId[0];
    }

    return requestId;
  }
}
