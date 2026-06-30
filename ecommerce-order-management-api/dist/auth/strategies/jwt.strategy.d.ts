import type { ConfigType } from '@nestjs/config';
import type { IUsersService } from '../../users/interfaces/users-service.interface';
import { authConfig } from '../../config/auth.config';
interface JwtPayload {
    sub: string;
    email: string;
}
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly usersService;
    constructor(config: ConfigType<typeof authConfig>, usersService: IUsersService);
    validate(payload: JwtPayload): Promise<any>;
}
export {};
