import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
export interface WrappedResponse<T> {
    success: boolean;
    data: T;
    meta?: Record<string, unknown>;
    requestId?: string;
    timestamp: string;
}
export declare class ResponseTransformInterceptor<T> implements NestInterceptor<T, WrappedResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<WrappedResponse<T>>;
    private getRequestId;
}
