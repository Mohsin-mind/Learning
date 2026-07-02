import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { RequestContextService } from '../context/request-context.service';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  constructor(private readonly contextService: RequestContextService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const existing = req.headers['x-request-id'];
    const requestId = (Array.isArray(existing) ? existing[0] : existing)?.trim() || randomUUID();

    req.headers['x-request-id'] = requestId;
    res.setHeader('x-request-id', requestId);

    this.contextService.run({ requestId }, next);
  }
}
