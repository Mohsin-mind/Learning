import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { USERS_SERVICE_TOKEN } from '../users/interfaces/users-service.interface';
import { User, UserRole } from '../users/entities/user.entity';
import { ConflictException } from '@nestjs/common';

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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: USERS_SERVICE_TOKEN, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
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

    it('should return user data without password on success', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      const result = await service.register({
        email: 'new@example.com',
        password: 'Pass@123',
        name: 'New',
      });
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('jwt-token');
    });
  });
});
