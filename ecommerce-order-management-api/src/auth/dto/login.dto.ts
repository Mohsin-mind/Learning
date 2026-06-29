import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@mailinator.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'User@123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
