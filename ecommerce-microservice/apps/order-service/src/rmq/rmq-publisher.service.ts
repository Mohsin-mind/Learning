import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RMQ_EXCHANGES } from '@app/common';
import { randomUUID } from 'crypto';

@Injectable()
export class RmqPublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RmqPublisherService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.ConfirmChannel | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const url = this.configService.get<string>('rabbitmq.url')!;
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createConfirmChannel();
      await this.channel.assertExchange(RMQ_EXCHANGES.ORDERS, 'topic', { durable: true });
      this.logger.log('Publisher connected, using topic exchange "orders"');
    } catch (err) {
      this.logger.error('Failed to connect publisher', err);
    }
  }

  async onModuleDestroy() {
    try { await this.channel?.close(); } catch { /* ignore */ }
    try { await this.connection?.close(); } catch { /* ignore */ }
  }

  async publish(routingKey: string, data: unknown): Promise<void> {
    if (!this.channel) throw new Error('Publisher not connected');
    const buffer = Buffer.from(JSON.stringify({ pattern: routingKey, data }));
    const published = this.channel.publish(RMQ_EXCHANGES.ORDERS, routingKey, buffer, {
      contentType: 'application/json',
      persistent: true,
      messageId: randomUUID(),
      timestamp: Math.floor(Date.now() / 1000),
    });
    if (published) {
      await this.channel.waitForConfirms();
    }
  }
}
