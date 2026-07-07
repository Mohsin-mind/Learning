import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { RMQ_QUEUES } from '@app/common';

interface DeadLetterRecord {
  receivedAt: string;
  sourceQueue: string;
  exchange: string;
  routingKey: string;
  properties: Record<string, unknown>;
  content: unknown;
  error?: string;
}

@Injectable()
export class DeadLetterService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeadLetterService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly store: DeadLetterRecord[] = [];

  constructor(private readonly configService: ConfigService) {}

  getDeadLetters(): DeadLetterRecord[] {
    return [...this.store];
  }

  async onModuleInit() {
    const url = this.configService.get<string>('rabbitmq.url')!;
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // The exchange, queue, and binding are already set up by setupInfrastructure() in main.ts.
      // We only consume here — no need to re-assert (which would conflict on exchange type).
      await this.channel.consume(
        RMQ_QUEUES.DEAD_LETTER,
        (msg) => {
          if (!msg) return;
          try {
            const record: DeadLetterRecord = {
              receivedAt: new Date().toISOString(),
              sourceQueue:
                (msg.properties.headers?.['x-first-death-queue'] as string) ?? 'unknown',
              exchange: msg.fields.exchange,
              routingKey: msg.fields.routingKey,
              properties: {
                type: msg.properties.type,
                headers: msg.properties.headers,
                messageId: msg.properties.messageId,
                timestamp: msg.properties.timestamp,
              },
              content: this.parseContent(msg.content),
            };
            this.store.push(record);
            this.logger.warn(
              `Dead letter #${this.store.length} stored — pattern: ${msg.properties.type}, ` +
                `queue: ${record.sourceQueue}`,
            );
            this.channel!.ack(msg);
          } catch {
            this.channel!.nack(msg, false, false);
          }
        },
        { noAck: false },
      );

      this.logger.log(`Listening on dead-letter queue "${RMQ_QUEUES.DEAD_LETTER}"`);
    } catch (err) {
      this.logger.error('Failed to connect dead-letter consumer', err);
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
    } catch { /* ignore */ }
    try {
      await this.connection?.close();
    } catch { /* ignore */ }
  }

  private parseContent(buf: Buffer): unknown {
    try {
      return JSON.parse(buf.toString());
    } catch {
      return buf.toString();
    }
  }
}
