import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { REQUEST_ID_TOKEN } from '../constants/di-tokens.constant';

const INTERNAL_SERVER_ERROR_STATUS = 500;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(
    @Inject(REQUEST_ID_TOKEN)
    private readonly generateRequestId: () => string,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { method, url } = request;
    const requestId = this.getRequestId(request);
    const now = Date.now();

    request.headers['x-request-id'] = requestId;
    response.setHeader('x-request-id', requestId);

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(
            `[${requestId}] ${method} ${url} ${response.statusCode} ${Date.now() - now}ms`,
          );
        },
        error: (error: unknown) => {
          const status =
            error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error instanceof Error ? error.message : 'Unknown error';

          this.logger.error(
            `[${requestId}] ${method} ${url} ${status} ${Date.now() - now}ms - ${message}`,
            status >= INTERNAL_SERVER_ERROR_STATUS && error instanceof Error
              ? error.stack
              : undefined,
          );
        },
      }),
    );
  }

  private getRequestId(request: Request): string {
    const requestId = request.headers['x-request-id'];

    if (Array.isArray(requestId)) {
      return requestId[0] ?? this.generateRequestId();
    }

    return requestId ?? this.generateRequestId();
  }
}
