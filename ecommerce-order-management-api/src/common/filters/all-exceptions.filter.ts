import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponseBody {
  success: false;
  statusCode: number;
  message: string[];
  error: string;
  path: string;
  data: null;
  requestId?: string;
  timestamp: string;
}

const INTERNAL_SERVER_ERROR_STATUS = 500;

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = this.getRequestId(request);
    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: ErrorResponseBody = {
      success: false,
      statusCode: status,
      message: this.getMessages(exception),
      error: this.getErrorName(exception, status),
      path: request.originalUrl,
      data: null,
      requestId,
      timestamp: new Date().toISOString(),
    };

    if (status >= INTERNAL_SERVER_ERROR_STATUS) {
      this.logger.error(
        `[${requestId}] ${request.method} ${request.originalUrl} ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`[${requestId}] ${request.method} ${request.originalUrl} ${status}`);
    }

    response.status(status).json(body);
  }

  private getMessages(exception: unknown): string[] {
    if (!(exception instanceof HttpException)) {
      return ['Internal server error'];
    }

    const exceptionResponse = exception.getResponse();
    if (typeof exceptionResponse === 'string') {
      return [exceptionResponse];
    }

    const message = (exceptionResponse as Record<string, unknown>).message;
    if (Array.isArray(message)) {
      return message.map(String);
    }

    return [typeof message === 'string' ? message : exception.message];
  }

  private getErrorName(exception: unknown, status: number): string {
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'error' in exceptionResponse
      ) {
        const error = (exceptionResponse as Record<string, unknown>).error;
        if (typeof error === 'string') {
          return error;
        }
      }

      return exception.name;
    }

    return status === INTERNAL_SERVER_ERROR_STATUS ? 'Internal Server Error' : 'Error';
  }

  private getRequestId(request: Request): string | undefined {
    const requestId = request.headers['x-request-id'];

    if (Array.isArray(requestId)) {
      return requestId[0];
    }

    return requestId;
  }
}
