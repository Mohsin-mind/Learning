import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { authConfig } from '../config/auth.config.js';
import { USER_REPOSITORY } from '../users/application/ports/outbound/user-repository.port.js';
import type { UserRepository } from '../users/application/ports/outbound/user-repository.port.js';
import { User, UserRole } from '../users/domain/user.entity.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
import { AuthResponseDto } from './dto/auth-response.dto.js';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser = new User(
      undefined as unknown as string, // Let DB generate UUID or pass undefined
      dto.email,
      dto.name,
      hashedPassword,
      UserRole.USER,
    );

    const savedUser = await this.userRepository.save(newUser);
    return AuthResponseDto.fromUser(savedUser, this.generateTokens(savedUser));
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.password) {
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
      const payload = this.jwtService.verify<{ sub: string; email: string }>(
        dto.refreshToken,
        {
          secret: this.config.jwtRefreshSecret,
        },
      );

      const user = await this.userRepository.findById(payload.sub);
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
