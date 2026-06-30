import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';
import { CreateUserInput, IUsersService } from './interfaces/users-service.interface';
export declare class UsersService implements IUsersService {
    private readonly userRepository;
    constructor(userRepository: UserRepository);
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    create(data: CreateUserInput): Promise<User>;
}
