import { RegisterDto } from '@/auth/dto/register.dto';
import { LoginDto } from '@/auth/dto/login.dto';
import { RefreshTokenDto } from '@/auth/dto/refresh-token.dto';
import { AuthResponseDto } from '@/auth/dto/auth-response.dto';

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthResponseDto>;
  login(dto: LoginDto): Promise<AuthResponseDto>;
  refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
}

export const AUTH_SERVICE_TOKEN = Symbol('AUTH_SERVICE_TOKEN');
