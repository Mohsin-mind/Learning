import { registerAs } from '@nestjs/config';

export const cacheConfig = registerAs('cache', () => ({
  ttl: process.env.CACHE_TTL ? Number(process.env.CACHE_TTL) : 60_000,
  max: process.env.CACHE_MAX ? Number(process.env.CACHE_MAX) : 100,
  store: process.env.NODE_ENV === 'production' ? 'redis' : 'memory',
}));
