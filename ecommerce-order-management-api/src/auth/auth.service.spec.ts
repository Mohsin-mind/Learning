import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { authConfig } from '../config/auth.config';
import { USERS_SERVICE_TOKEN } from '../users/interfaces/users-service.interface';
import { User, UserRole } from '../users/entities/user.entity';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser: User = {
    id: 'uuid-1',
    email: 'test@example.com',
    password: 'hashed-password',
    name: 'Test User',
    role: UserRole.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('jwt-token'),
    verify: jest.fn(),
  };

  const mockAuthConfig = {
    jwtRefreshSecret: 'test-refresh-secret',
    jwtAccessSecret: 'test-secret',
    jwtAccessExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USERS_SERVICE_TOKEN, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: authConfig.KEY, useValue: mockAuthConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if email exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      await expect(
        service.register({ email: 'test@example.com', password: 'Pass@123', name: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should return user data with tokens on success', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      const result = await service.register({
        email: 'new@example.com',
        password: 'Pass@123',
        name: 'New',
      });
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('jwt-token');
      expect(result.refreshToken).toBe('jwt-token');
    });
  });

  describe('refresh', () => {
    it('should throw UnauthorizedException if token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });
      await expect(service.refresh({ refreshToken: 'invalid-token' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return new tokens on valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'uuid-1', email: 'test@example.com' });
      mockUsersService.findById.mockResolvedValue(mockUser);
      const result = await service.refresh({ refreshToken: 'valid-token' });
      expect(result.accessToken).toBe('jwt-token');
      expect(result.refreshToken).toBe('jwt-token');
      expect(result.user.email).toBe('test@example.com');
    });
  });
});
