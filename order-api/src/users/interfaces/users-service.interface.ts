import { User } from '../entities/user.entity';

export interface IUsersService {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: Partial<User>): Promise<User>;
}

export const USERS_SERVICE_TOKEN = Symbol('USERS_SERVICE_TOKEN');
