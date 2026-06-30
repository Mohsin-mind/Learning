import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    let requestId = req.headers['x-request-id'];

    if (!requestId) {
      requestId = randomUUID();
      req.headers['x-request-id'] = requestId;
    } else if (Array.isArray(requestId)) {
      requestId = requestId[0] ?? randomUUID();
      req.headers['x-request-id'] = requestId;
    }

    res.setHeader('x-request-id', requestId);
    next();
  }
}
