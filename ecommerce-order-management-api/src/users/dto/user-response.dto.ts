import { ApiProperty } from '@nestjs/swagger';
import { User, UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({ example: '8ddf2c11-5f9d-4b8e-82bc-02a3b30c7d54' })
  id: string;

  @ApiProperty({ example: 'user@mailinator.com' })
  email: string;

  @ApiProperty({ example: 'Regular User' })
  name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  role: UserRole;

  @ApiProperty({ example: '2026-06-26T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-26T10:00:00.000Z' })
  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
