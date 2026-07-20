import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { cacheConfig } from './cache.config';
import { redisConfig } from './redis.config';
import { configValidationSchema } from './config.validation';
import { databaseConfig } from './database.config';
import { algoliaConfig } from './algolia.config';

const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${nodeEnv}`,
      load: [appConfig, authConfig, databaseConfig, cacheConfig, redisConfig, algoliaConfig],
      validationSchema: configValidationSchema,
      ignoreEnvVars: false,
    }),
  ],
})
export class ConfigModule {}
