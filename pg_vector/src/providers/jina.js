const MODEL = 'jina-embeddings-v3';

async function generateEmbedding(text) {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) throw new Error('JINA_API_KEY not set in .env');

  const res = await fetch('https://api.jina.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      input: [text],
      normalized: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Jina API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

module.exports = { provider: 'jina', dimension: 1024, generateEmbedding };
