import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { algoliasearch } from 'algoliasearch';
import type { SearchResponse } from 'algoliasearch';
import { algoliaConfig } from '@/config/algolia.config';

@Injectable()
export class AlgoliaService {
  private readonly logger = new Logger(AlgoliaService.name);
  private readonly client: ReturnType<typeof algoliasearch>;

  constructor(
    @Inject(algoliaConfig.KEY)
    private readonly config: ConfigType<typeof algoliaConfig>,
  ) {
    this.client = algoliasearch(config.appId, config.writeApiKey);
  }

  async search<T = Record<string, unknown>>(
    indexName: string,
    query: string,
    options?: { page?: number; hitsPerPage?: number },
  ): Promise<SearchResponse<T>> {
    return this.client.searchSingleIndex<T>({
      indexName,
      searchParams: {
        query,
        page: options?.page ?? 0,
        hitsPerPage: options?.hitsPerPage ?? 20,
      },
    });
  }

  async saveObject(
    indexName: string,
    object: { objectID: string } & Record<string, unknown>,
  ): Promise<void> {
    await this.client.saveObject({ indexName, body: object });
    this.logger.debug(`Indexed ${indexName}/${object.objectID}`);
  }

  async deleteObject(indexName: string, objectID: string): Promise<void> {
    await this.client.deleteObject({ indexName, objectID });
    this.logger.debug(`Deleted from ${indexName}/${objectID}`);
  }

  async clearObjects(indexName: string): Promise<void> {
    await this.client.clearObjects({ indexName });
    this.logger.debug(`Cleared index ${indexName}`);
  }
}
