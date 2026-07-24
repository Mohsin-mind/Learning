import { registerAs } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'super-secret-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'super-refresh-secret-key-change-in-production',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '1y',
}));
