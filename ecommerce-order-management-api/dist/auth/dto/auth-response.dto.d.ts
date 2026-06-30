import { User } from '../../users/entities/user.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
export declare class AuthResponseDto {
    user: UserResponseDto;
    accessToken: string;
    refreshToken: string;
    static fromUser(user: User, tokens: {
        accessToken: string;
        refreshToken: string;
    }): AuthResponseDto;
}
