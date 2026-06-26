import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { cacheConfig } from './cache.config';
import { configValidationSchema } from './config.validation';
import { databaseConfig } from './database.config';

const nodeEnv = process.env.NODE_ENV || 'development';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${nodeEnv}`, '.env'],
      load: [appConfig, authConfig, databaseConfig, cacheConfig],
      validationSchema: configValidationSchema,
      ignoreEnvVars: false,
    }),
  ],
})
export class ConfigModule {}
