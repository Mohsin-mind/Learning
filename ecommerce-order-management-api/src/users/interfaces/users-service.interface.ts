import { User, UserRole } from '../entities/user.entity';

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface IUsersService {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserInput): Promise<User>;
}

export const USERS_SERVICE_TOKEN = Symbol('USERS_SERVICE_TOKEN');
