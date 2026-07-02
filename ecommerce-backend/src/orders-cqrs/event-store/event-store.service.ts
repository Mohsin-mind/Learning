import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoredEvent } from './event.entity';

@Injectable()
export class EventStoreService {
  constructor(
    @InjectRepository(StoredEvent)
    private readonly repository: Repository<StoredEvent>,
  ) {}

  async append(
    aggregateId: string,
    aggregateType: string,
    eventType: string,
    payload: Record<string, unknown>,
    version?: number,
  ): Promise<void> {
    const eventVersion = version ?? (await this.getNextVersion(aggregateId));

    try {
      await this.repository.save({
        aggregateId,
        aggregateType,
        eventType,
        payload,
        version: eventVersion,
      });
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as { code: string }).code === '23505'
      ) {
        throw new ConflictException(
          `Version conflict for aggregate ${aggregateId} at version ${eventVersion}`,
        );
      }
      throw error;
    }
  }

  private async getNextVersion(aggregateId: string): Promise<number> {
    const { max } = (await this.repository
      .createQueryBuilder('event')
      .select('MAX(event.version)', 'max')
      .where('event.aggregateId = :aggregateId', { aggregateId })
      .getRawOne<{ max: string | null }>()) ?? { max: null };

    return Number(max ?? 0) + 1;
  }

  async getEvents(aggregateId: string): Promise<StoredEvent[]> {
    return this.repository.find({
      where: { aggregateId },
      order: { version: 'ASC' },
    });
  }
}
