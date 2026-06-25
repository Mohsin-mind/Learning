import { IsEmail, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX } from '../../common/constants/regex.constant';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin@123',
    description: 'Min 8 chars, uppercase, lowercase, and number',
  })
  @IsString()
  @Matches(REGEX.PASSWORD, {
    message:
      'Password must be at least 8 characters and contain uppercase, lowercase, and a number',
  })
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;
}
