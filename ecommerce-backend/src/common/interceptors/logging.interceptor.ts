import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { RequestContextService } from '../context/request-context.service';

const INTERNAL_SERVER_ERROR_STATUS = 500;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  constructor(private readonly contextService: RequestContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { method, url } = request;
    const requestId = this.contextService.get('requestId') || 'unknown';
    const now = Date.now();

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
}
