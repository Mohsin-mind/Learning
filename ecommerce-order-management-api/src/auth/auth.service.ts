import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { authConfig } from '../config/auth.config';
import type { IUsersService } from '../users/interfaces/users-service.interface';
import { USERS_SERVICE_TOKEN } from '../users/interfaces/users-service.interface';
import type { IAuthService } from './interfaces/auth-service.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USERS_SERVICE_TOKEN)
    private readonly usersService: IUsersService,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
    });

    return AuthResponseDto.fromUser(user, this.generateTokens(user));
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return AuthResponseDto.fromUser(user, this.generateTokens(user));
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string }>(dto.refreshToken, {
        secret: this.config.jwtRefreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return AuthResponseDto.fromUser(user, this.generateTokens(user));
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private generateTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.jwtAccessExpiresIn as never,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.jwtRefreshSecret,
      expiresIn: this.config.jwtRefreshExpiresIn as never,
    });

    return { accessToken, refreshToken };
  }
}
