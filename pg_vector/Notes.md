
# How to install pgvector on PostgreSQL

## Install PostgreSQL 17 (if not already installed)

```bash
# Add PostgreSQL official repo (for Ubuntu 20.04 focal, use archive)
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc
echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt-archive.postgresql.org/pub/repos/apt focal-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt-get update
sudo apt-get install -y postgresql-17 postgresql-server-dev-17
```

## Install pgvector

```bash
# Build dependencies are already included in postgresql-server-dev-17

git clone https://github.com/pgvector/pgvector.git /tmp/pgvector
cd /tmp/pgvector
make
sudo make install
```

## Create database & enable extension

```bash
sudo service postgresql restart
sudo -u postgres createdb vector_demo
sudo -u postgres psql -d vector_demo -c "CREATE EXTENSION vector;"

# ── Step 4: Demo ──
# Create the documents table
# NOTE: vector dimension depends on your embedding provider:
#   local → 384  (all-MiniLM-L6-v2)
#   jina  → 1024 (jina-embeddings-v3)
sudo -u postgres psql -d vector_demo -c "
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(384),        -- change to 1024 if using Jina
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO documents (title, content, embedding) VALUES
  ('apple',  'A fruit that grows on trees',    '[1, 0, 0]'),
  ('banana', 'A yellow tropical fruit',        '[0.8, 0.2, 0.1]'),
  ('car',    'A vehicle with four wheels',     '[0, 1, 0]');

-- Find 3 closest documents to [1, 0, 0]
SELECT title, content, embedding <-> '[1, 0, 0]' AS distance
FROM documents ORDER BY distance LIMIT 3;
"
Result: pgvector installed. Demo database vector_demo is ready. Connect with:
sudo -u postgres psql -d vector_demo


# pgvector Demo — Local Embedding API

## Start Server

```bash
cd /home/mind/workspace/Other/demo/Learning/pg_vector
pnpm dev      # dev with nodemon (auto-restart on changes)
# or
pnpm start    # production mode
# Wait ~15s for model to load (all-MiniLM-L6-v2)
```

## API Endpoints

### Create a document (auto-embeds content)
```bash
curl -X POST http://localhost:3003/documents \
  -H "Content-Type: application/json" \
  -d '{"title":"My Doc","content":"Your document text here"}'
```

### Search by semantic similarity
```bash
curl "http://localhost:3003/documents/search?q=your+search+query&limit=5"
```

### List all documents
```bash
curl http://localhost:3003/documents
```

## Stack

- **PostgreSQL 17** + **pgvector 0.8.3**
- **Node.js** + **Express**
- **@xenova/transformers** (local embedding) / **Jina AI** (remote API)

## Switching Embedding Provider

Edit `src/embedding.js:6` — change `'local'` to `'jina'`:

```js
const ACTIVE_PROVIDER = 'local'; // → change to 'jina'
```

Then update the DB column to match:
```bash
echo "mind" | sudo -S -u postgres psql -d vector_demo -c "
  ALTER TABLE documents DROP COLUMN embedding;
  ALTER TABLE documents ADD COLUMN embedding vector(1024);
"
```

### Providers

| Provider | File | Dims | Needs |
|---|---|---|---|
| `local` | `src/providers/local.js` | 384 | Model cached in `./model_cache` |
| `jina` | `src/providers/jina.js` | 1024 | `JINA_API_KEY` in `.env` |

## Data

Data stored in local storage vector_demo -> documents table.
