import { registerAs } from '@nestjs/config';

export const algoliaConfig = registerAs('algolia', () => ({
  appId: process.env.ALGOLIA_APP_ID ?? '',
  writeApiKey: process.env.ALGOLIA_WRITE_API_KEY ?? '',
  searchApiKey: process.env.ALGOLIA_SEARCH_API_KEY ?? '',
}));
