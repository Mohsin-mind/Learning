import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheStampedeService {
  private readonly logger = new Logger(CacheStampedeService.name);

  private readonly LOCK_TTL = 5_000;
  private readonly MAX_RETRIES = 10;
  private readonly RETRY_BASE_MS = 100;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /* Pattern 1 — Mutex (lock-based): only one request recomputes, others wait */
  async getOrComputeWithMutex<T>(
    cacheKey: string,
    lockKey: string,
    fetchFn: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const cached = await this.cacheManager.get<T>(cacheKey);
    if (cached !== null && cached !== undefined) return cached;

    const lockAcquired = await this.acquireLock(lockKey);
    if (lockAcquired) {
      try {
        const recheck = await this.cacheManager.get<T>(cacheKey);
        if (recheck !== null && recheck !== undefined) return recheck;

        const value = await fetchFn();
        await this.cacheManager.set(cacheKey, value, ttl);
        return value;
      } finally {
        await this.cacheManager.del(lockKey);
      }
    }

    for (let i = 0; i < this.MAX_RETRIES; i++) {
      await this.sleep(this.RETRY_BASE_MS * (i + 1));
      const value = await this.cacheManager.get<T>(cacheKey);
      if (value !== null && value !== undefined) return value;
    }

    this.logger.warn(`Mutex timeout for ${cacheKey}, computing directly`);
    const value = await fetchFn();
    await this.cacheManager.set(cacheKey, value, ttl);
    return value;
  }

  /* Pattern 2 — PEE: each request independently may recompute early, staggering without coordination */
  async getWithProbabilisticExpiry<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl: number,
  ): Promise<T> {
    const raw = await this.cacheManager.get<{ value: T; createdAt: number }>(cacheKey);
    if (!raw) {
      const value = await fetchFn();
      await this.cacheManager.set(cacheKey, { value, createdAt: Date.now() }, ttl);
      return value;
    }

    const age = Date.now() - raw.createdAt;
    const remaining = 1 - age / ttl;

    const BETA = 0.2;
    if (remaining > BETA) return raw.value;

    const probability = (BETA - remaining) / BETA / 10;
    if (Math.random() < probability) {
      this.logger.debug(`PEE early recompute for ${cacheKey} (remaining=${remaining.toFixed(3)})`);
      const value = await fetchFn();
      await this.cacheManager.set(cacheKey, { value, createdAt: Date.now() }, ttl);
      return value;
    }

    return raw.value;
  }

  /* Pattern 3 — SWR: serve stale data instantly; one request refreshes in background */
  async getWithStaleWhileRevalidate<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    freshTtl: number,
    staleTtl: number,
  ): Promise<T> {
    const raw = await this.cacheManager.get<{ value: T; expiresAt: number }>(cacheKey);
    if (!raw) {
      const value = await fetchFn();
      await this.cacheManager.set(
        cacheKey,
        { value, expiresAt: Date.now() + freshTtl },
        freshTtl + staleTtl,
      );
      return value;
    }

    const isFresh = Date.now() < raw.expiresAt;
    if (isFresh) return raw.value;

    const refreshLockKey = `${cacheKey}:swr:lock`;
    const lockHeld = await this.acquireLock(refreshLockKey);
    if (lockHeld) {
      void this.refreshInBackground(cacheKey, fetchFn, freshTtl, staleTtl, refreshLockKey);
    }

    return raw.value;
  }

  private async refreshInBackground<T>(
    cacheKey: string,
    fetchFn: () => Promise<T>,
    freshTtl: number,
    staleTtl: number,
    lockKey: string,
  ): Promise<void> {
    try {
      const value = await fetchFn();
      await this.cacheManager.set(
        cacheKey,
        { value, expiresAt: Date.now() + freshTtl },
        freshTtl + staleTtl,
      );
      this.logger.debug(`SWR background refresh complete for ${cacheKey}`);
    } catch (err) {
      this.logger.error(`SWR background refresh failed for ${cacheKey}`, err);
    } finally {
      await this.cacheManager.del(lockKey);
    }
  }

  /* Acquire a distributed lock. In production with Redis, use SET NX for true atomicity. */
  private async acquireLock(lockKey: string): Promise<boolean> {
    const existing = await this.cacheManager.get<string>(lockKey);
    if (existing) return false;

    await this.cacheManager.set(lockKey, '1', this.LOCK_TTL);
    return true;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
