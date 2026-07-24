import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../domain/user.entity.js';
import { UserRepository } from '../../application/ports/outbound/user-repository.port.js';
import { TypeOrmUser, OrmUserRole } from './typeorm-user.entity.js';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(TypeOrmUser)
    private readonly repo: Repository<TypeOrmUser>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { id } });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repo.findOne({ where: { email } });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async save(user: User): Promise<User> {
    const orm = this.repo.create({
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: (user.role as unknown) as OrmUserRole,
    });
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(orm: TypeOrmUser): User {
    return new User(
      orm.id,
      orm.email,
      orm.name,
      orm.password,
      (orm.role as unknown) as UserRole,
    );
  }
}