import type { IAuthService } from './interfaces/auth-service.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { User } from '../users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: IAuthService);
    register(dto: RegisterDto): any;
    login(dto: LoginDto): any;
    refresh(dto: RefreshTokenDto): any;
    getProfile(user: User): any;
}
