import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IUsersService } from '../../users/interfaces/users-service.interface';
import { UserRole } from '../../users/entities/user.entity';

const logger = new Logger('UserSeed');

export async function userSeed(usersService: IUsersService): Promise<void> {
  const admin = await usersService.findByEmail('admin@mailinator.com');
  if (!admin) {
    await usersService.create({
      email: 'admin@mailinator.com',
      password: await bcrypt.hash('Admin@123', 10),
      name: 'Admin User',
      role: UserRole.ADMIN,
    });
    logger.log('Admin created: admin@mailinator.com / Admin@123');
  } else {
    logger.log('Admin already exists');
  }

  const user = await usersService.findByEmail('user@mailinator.com');
  if (!user) {
    await usersService.create({
      email: 'user@mailinator.com',
      password: await bcrypt.hash('User@123', 10),
      name: 'Regular User',
      role: UserRole.USER,
    });
    logger.log('User created: user@mailinator.com / User@123');
  } else {
    logger.log('User already exists');
  }
}
