const PROVIDERS = {
  local: require('./providers/local'),
  jina: require('./providers/jina'),
};

const ACTIVE_PROVIDER = 'jina'; // ← change to 'jina' to switch

function getProvider() {
  const provider = PROVIDERS[ACTIVE_PROVIDER];
  if (!provider) throw new Error(`Unknown provider: ${ACTIVE_PROVIDER}`);
  return provider;
}

function getActiveDimension() {
  return getProvider().dimension;
}

function getActiveProviderName() {
  return getProvider().provider;
}

async function generateEmbedding(text) {
  return getProvider().generateEmbedding(text);
}

module.exports = { generateEmbedding, getActiveDimension, getActiveProviderName };
