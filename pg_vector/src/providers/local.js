const { pipeline } = require('@xenova/transformers');

let extractor = null;

async function generateEmbedding(text) {
  if (!extractor) {
    console.log('Loading local model (all-MiniLM-L6-v2)...');
    extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      cache_dir: './model_cache',
    });
    console.log('Local model loaded');
  }
  const result = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(result.data);
}

module.exports = { provider: 'local', dimension: 384, generateEmbedding };
