import { Module } from '@nestjs/common';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './user.repository';
import { USERS_SERVICE_TOKEN } from './interfaces/users-service.interface';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    {
      provide: USERS_SERVICE_TOKEN,
      useClass: UsersService,
    },
    UserRepository,
  ],
  exports: [USERS_SERVICE_TOKEN],
})
export class UsersModule {}
