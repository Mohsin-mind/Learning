import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { USERS_SERVICE_TOKEN } from '@/users/interfaces/users-service.interface';
import type { IUsersService } from '@/users/interfaces/users-service.interface';
import { userSeed } from './user.seed';

async function bootstrap() {
  const logger = new Logger('Seed');
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const usersService = app.get<IUsersService>(USERS_SERVICE_TOKEN);
    await userSeed(usersService);
    logger.log('Seed complete');
  } catch (err) {
    logger.error('Seed failed', err instanceof Error ? err.stack : String(err));
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
