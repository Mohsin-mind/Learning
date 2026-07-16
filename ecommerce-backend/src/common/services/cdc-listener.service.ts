import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Client, type Notification } from 'pg';
import { databaseConfig } from '@/config/database.config';

export interface CdcPayload {
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  id: string;
  timestamp: number;
}

export type CdcHandler = (payload: CdcPayload) => void;

@Injectable()
export class CdcListenerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(CdcListenerService.name);
  private readonly channels = new Map<string, CdcHandler>();
  private client: Client | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private destroyed = false;

  constructor(
    @Inject(databaseConfig.KEY)
    private readonly dbConfig: ConfigType<typeof databaseConfig>,
  ) {}

  register(channel: string, handler: CdcHandler): void {
    this.channels.set(channel, handler);
  }

  async onApplicationBootstrap(): Promise<void> {
    if (this.channels.size === 0) return;
    await this.connectAndListen();
  }

  async onModuleDestroy(): Promise<void> {
    this.destroyed = true;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.client) {
      try {
        await this.client.end();
      } catch {
        // ignore close errors
      }
      this.client = null;
    }
  }

  private async connectAndListen(): Promise<void> {
    if (this.destroyed) return;

    this.client = new Client({
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      user: this.dbConfig.username,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
    });

    this.client.on('notification', (msg: Notification) => {
      const handler = msg.channel ? this.channels.get(msg.channel) : undefined;
      if (!handler) return;

      try {
        const payload = JSON.parse(msg.payload ?? '{}') as CdcPayload;
        handler(payload);
      } catch {
        this.logger.warn(`CDC — unparseable payload on ${msg.channel}: ${msg.payload}`);
      }
    });

    this.client.on('error', (err: Error) => {
      this.logger.error('CDC connection error', err.message);
      this.scheduleReconnect();
    });

    this.client.on('end', () => {
      this.logger.warn('CDC connection ended');
      if (!this.destroyed) this.scheduleReconnect();
    });

    try {
      await this.client.connect();
      for (const channel of this.channels.keys()) {
        await this.client.query(`LISTEN "${channel}"`);
      }
      this.logger.log(`CDC listening on channels: ${[...this.channels.keys()].join(', ')}`);
    } catch (err) {
      this.logger.error('CDC connection failed', err);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.destroyed || this.retryTimer) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connectAndListen().catch((err: Error) =>
        this.logger.error('CDC reconnect failed', err.message),
      );
    }, 5_000);
  }
}
