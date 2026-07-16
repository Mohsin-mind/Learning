import { OrderSalesSummary } from '@/orders/entities/order-sales-summary.entity';
import { DashboardNote } from '../entities/dashboard-note.entity';

export interface IDashboardService {
  getSalesSummary(): Promise<OrderSalesSummary[]>;
  invalidateSalesCache(): Promise<void>;

  getNotes(): Promise<DashboardNote[]>;
  createNote(message: string): Promise<DashboardNote>;
  createNoteAsync(message: string): Promise<{ id: string; message: string }>;
  invalidateNotesCache(): Promise<void>;

  // Cache stampede prevention demos
  getNotesWithMutex(): Promise<DashboardNote[]>;
  getNotesWithPEE(): Promise<DashboardNote[]>;
  getNotesWithSWR(): Promise<DashboardNote[]>;
} // end IDashboardService

export const DASHBOARD_SERVICE_TOKEN = Symbol('DASHBOARD_SERVICE_TOKEN');
