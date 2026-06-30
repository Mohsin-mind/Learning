import { IsEmail, IsString, Matches, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { REGEX } from '@/common/constants/app.constants';

export class RegisterDto {
  @ApiProperty({ example: 'user@mailinator.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'User@123',
    description: 'Min 8 chars, uppercase, lowercase, and number',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(REGEX.PASSWORD, {
    message:
      'Password must be at least 8 characters and contain uppercase, lowercase, and a number',
  })
  password: string;

  @ApiProperty({ example: 'Regular User' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
