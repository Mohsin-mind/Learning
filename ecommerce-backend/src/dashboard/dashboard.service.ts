import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import crypto from 'node:crypto';
import { OrderSalesSummary } from '@/orders/entities/order-sales-summary.entity';
import { OrderSalesSummaryRepository } from '@/orders/order-sales-summary.repository';
import { DashboardNote } from './entities/dashboard-note.entity';
import { DashboardNoteRepository } from './dashboard-note.repository';
import { IDashboardService } from './interfaces/dashboard-service.interface';
import { DASHBOARD_CACHE } from '@/common/constants/app.constants';

@Injectable()
export class DashboardService implements IDashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly orderSalesSummaryRepo: OrderSalesSummaryRepository,
    private readonly noteRepo: DashboardNoteRepository,
  ) {}

  /* Cache-Aside (Lazy Loading): check cache first, fall back to DB on miss, populate cache */
  async getSalesSummary(): Promise<OrderSalesSummary[]> {
    const cached = await this.cacheManager.get<OrderSalesSummary[]>(DASHBOARD_CACHE.SALES_KEY);
    if (cached) return cached;

    const data = await this.orderSalesSummaryRepo.find({ order: { orderMonth: 'DESC' } });
    await this.cacheManager.set(DASHBOARD_CACHE.SALES_KEY, data, DASHBOARD_CACHE.TTL);
    return data;
  }

  /* Granular Invalidation: delete single cache key instead of clearing entire cache */
  async invalidateSalesCache(): Promise<void> {
    await this.cacheManager.del(DASHBOARD_CACHE.SALES_KEY);
  }

  /* Cache-Aside (Lazy Loading): same pattern on notes data */
  async getNotes(): Promise<DashboardNote[]> {
    const cached = await this.cacheManager.get<DashboardNote[]>(DASHBOARD_CACHE.NOTES_KEY);
    if (cached) return cached;

    const data = await this.noteRepo.find({ order: { createdAt: 'DESC' } });
    await this.cacheManager.set(DASHBOARD_CACHE.NOTES_KEY, data, DASHBOARD_CACHE.TTL);
    return data;
  }

  /* Write-Through: save to DB and update cache synchronously before responding */
  async createNote(message: string): Promise<DashboardNote> {
    const note = await this.noteRepo.save(this.noteRepo.create({ message }));

    const notes = await this.noteRepo.find({ order: { createdAt: 'DESC' } });
    await this.cacheManager.set(DASHBOARD_CACHE.NOTES_KEY, notes, DASHBOARD_CACHE.TTL);

    return note;
  }

  /* Write-Behind (Write-Back): cache immediately, call DB persist in background, respond */
  createNoteAsync(message: string): Promise<{ id: string; message: string }> {
    const id = crypto.randomUUID();
    const preview = { id, message };

    this.cacheManager.get<DashboardNote[]>(DASHBOARD_CACHE.NOTES_KEY).then((existing) => {
      const notes = existing || [];
      this.cacheManager.set(DASHBOARD_CACHE.NOTES_KEY, [{ id, message, createdAt: new Date() } as DashboardNote, ...notes], DASHBOARD_CACHE.TTL);
    });

    this.persistNoteInBackground(id, message);
    return Promise.resolve(preview);
  }

  private persistNoteInBackground(id: string, message: string): void {
    this.noteRepo.save({ id, message } as DashboardNote).catch((err) => {
      this.logger.error('Write-behind persist to DB failed', err);
    });
  }

  /* Granular Invalidation: delete single cache key for notes */
  async invalidateNotesCache(): Promise<void> {
    await this.cacheManager.del(DASHBOARD_CACHE.NOTES_KEY);
  }

  /* Refresh-Ahead: proactively warm cache before TTL expiry, preventing cache misses */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async refreshAhead() {
    this.logger.log('Refresh-ahead: warming sales cache');
    const data = await this.orderSalesSummaryRepo.find({ order: { orderMonth: 'DESC' } });
    await this.cacheManager.set(DASHBOARD_CACHE.SALES_KEY, data, DASHBOARD_CACHE.TTL);
  }
}
