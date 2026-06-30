import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '@/users/users.module';
import { authConfig } from '@/config/auth.config';
import { AUTH_SERVICE_TOKEN } from './interfaces/auth-service.interface';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.jwtAccessSecret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_SERVICE_TOKEN,
      useClass: AuthService,
    },
    JwtStrategy,
  ],
  exports: [AUTH_SERVICE_TOKEN],
})
export class AuthModule {}
