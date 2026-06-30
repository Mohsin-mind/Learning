import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { authConfig } from '../config/auth.config';
import type { IUsersService } from '../users/interfaces/users-service.interface';
import type { IAuthService } from './interfaces/auth-service.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
export declare class AuthService implements IAuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    constructor(usersService: IUsersService, jwtService: JwtService, config: ConfigType<typeof authConfig>);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshTokenDto): Promise<AuthResponseDto>;
    private generateTokens;
}
