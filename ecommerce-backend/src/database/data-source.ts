import 'tsconfig-paths/register';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { DataSource } from 'typeorm';

const nodeEnv = process.env.NODE_ENV || 'development';
const projectRoot = resolve(__dirname, '../../');

config({ path: resolve(projectRoot, `.env.${nodeEnv}`) });

function getEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: getEnv('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 5432),
  username: getEnv('DB_USERNAME'),
  password: getEnv('DB_PASSWORD'),
  database: getEnv('DB_DATABASE'),
  entities: [resolve(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [resolve(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
});

export default AppDataSource;
