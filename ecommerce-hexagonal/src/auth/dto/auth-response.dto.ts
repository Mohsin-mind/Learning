import { User } from "../../users/domain/user.entity.js";

export class AuthResponseDto {
  user!: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken!: string;
  refreshToken!: string;

  static fromUser(
    user: User,
    tokens: { accessToken: string; refreshToken: string },
  ): AuthResponseDto {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
