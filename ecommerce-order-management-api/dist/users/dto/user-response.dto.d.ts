import { User, UserRole } from '../entities/user.entity';
export declare class UserResponseDto {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
    static fromEntity(user: User): UserResponseDto;
}
