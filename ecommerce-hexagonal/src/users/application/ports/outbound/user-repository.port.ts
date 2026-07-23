import { User } from '../../../domain/user.entity.js';

export const USER_REPOSITORY = Symbol('UserRepository');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
}