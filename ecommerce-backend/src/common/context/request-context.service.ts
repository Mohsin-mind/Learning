import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  requestId: string;
}

@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<RequestContext>();

  run(context: RequestContext, callback: () => void) {
    this.als.run(context, callback);
  }

  getStore(): RequestContext | undefined {
    return this.als.getStore();
  }

  get<T extends keyof RequestContext>(key: T): RequestContext[T] | undefined {
    return this.als.getStore()?.[key];
  }
}
