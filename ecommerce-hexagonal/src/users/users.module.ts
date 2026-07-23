import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUser } from './infrastructure/persistence/typeorm-user.entity.js';
import { TypeOrmUserRepository } from './infrastructure/persistence/typeorm-user.repository.js';
import { USER_REPOSITORY } from './application/ports/outbound/user-repository.port.js';

@Module({
  imports: [TypeOrmModule.forFeature([TypeOrmUser])],
  providers: [
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}