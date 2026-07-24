import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    console.log('[JwtAuthGuard] handleRequest - err:', err);
    console.log('[JwtAuthGuard] handleRequest - user:', user);
    console.log('[JwtAuthGuard] handleRequest - info (Passport error/info):', info);

    if (err || !user) {
      console.log('[JwtAuthGuard] Authentication failed. Throwing UnauthorizedException.');
      throw err || new Error(info?.message || 'Unauthorized');
    }
    return user;
  }
}
