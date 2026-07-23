import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../domain/user.entity.js';
import { UserRepository } from '../../application/ports/outbound/user-repository.port.js';
import { TypeOrmUser } from './typeorm-user.entity.js';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(TypeOrmUser)
    private readonly repo: Repository<TypeOrmUser>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) return null;
    return new User(orm.id, orm.email, orm.name);
  }
}