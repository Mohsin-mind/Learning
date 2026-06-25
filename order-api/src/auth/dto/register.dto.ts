import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Admin@123', description: 'Min 8 chars, uppercase, lowercase, and number' })
  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must be at least 8 characters and contain uppercase, lowercase, and a number',
  })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;
}
