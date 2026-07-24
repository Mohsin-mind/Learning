import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import { authConfig } from '../../config/auth.config.js';
import { USER_REPOSITORY } from '../../users/application/ports/outbound/user-repository.port.js';
import type { UserRepository } from '../../users/application/ports/outbound/user-repository.port.js';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(authConfig.KEY)
    config: ConfigType<typeof authConfig>,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {
    console.log('[JwtStrategy] Secret initialized with length:', config.jwtAccessSecret?.length, 'Secret snippet:', config.jwtAccessSecret?.slice(0, 5) + '...');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtAccessSecret,
    });
  }

  async validate(payload: JwtPayload) {
    console.log('[JwtStrategy] Validating payload:', payload);
    const user = await this.userRepository.findById(payload.sub);
    console.log('[JwtStrategy] Found user in DB:', user ? user.id : 'NULL');
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }
    return user;
  }
}
