
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
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(384),        -- change to 1024 if using Jina
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE SEQUENCE IF NOT EXISTS documents_slug_seq;

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

---

# PostgREST — Auto-generated REST API

PostgREST turns a PostgreSQL schema into a REST API with zero code. It maps tables → endpoints, columns → fields, and uses HTTP verbs for CRUD.

## Setup

```bash
# 1. Install PostgREST binary
curl -sL https://github.com/PostgREST/postgrest/releases/download/v14.13/postgrest-v14.13-linux-static-x86-64.tar.xz -o /tmp/pgrst.tar.xz
tar -xf /tmp/pgrst.tar.xz -C /tmp
sudo cp /tmp/postgrest /usr/local/bin/postgrest

# 2. Create schema, table & anonymous role
PGPASSWORD=Mind@123 psql -h localhost -U postgres -d vector_demo -c "
CREATE SCHEMA IF NOT EXISTS api;

CREATE TABLE IF NOT EXISTS api.products (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE ROLE web_anon NOINHERIT LOGIN;
GRANT USAGE ON SCHEMA api TO web_anon;
GRANT ALL ON api.products TO web_anon;
GRANT USAGE ON SEQUENCE api.products_id_seq TO web_anon;
"

# 3. Start PostgREST
postgrest ./postgrest.conf
```

## API Endpoints (auto-generated)

All at `http://localhost:3001`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List all products |
| GET | `/products?id=eq.1` | Filter by id |
| POST | `/products` | Create product |
| PATCH | `/products?id=eq.1` | Update product |
| DELETE | `/products?id=eq.1` | Delete product |

## Examples

```bash
# List
curl http://localhost:3001/products

# Create (returns new row with `Prefer: return=representation`)
curl -X POST http://localhost:3001/products \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"name":"Keyboard","price":89.99,"category":"Electronics"}'

# Update
curl -X PATCH 'http://localhost:3001/products?id=eq.1' \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"price":24.99}'

# Delete
curl -X DELETE 'http://localhost:3001/products?id=eq.4'
```

## How it works

- PostgREST reads the `api` schema and exposes every table as `/tablename`
- HTTP verbs map directly: GET (read), POST (create), PATCH (update), DELETE
- Filtering via query params: `?column=eq.value`, `?column=gte.value`, `?column=like.*pattern*`
- No application code needed — it's all database-driven
- The `db-anon-role` defines permissions for unauthenticated users
- For auth, add a JWT secret to `postgrest.conf` and use RLS policies

## Config (`postgrest.conf`)

```
db-uri = "postgres://postgres:Mind%40123@localhost:5432/vector_demo"
db-schemas = "api"
db-anon-role = "web_anon"
server-port = 3001
```
## Stop postgrest
```bash
pnpm pgrest:stop

or

pkill postgrest && echo "stopped" || echo "not running"
```

## Stack

- **PostgREST 14.13** — standalone HTTP server
- **PostgreSQL 17** — single source of truth (schema, permissions, data)
- No Express routes needed for products — PostgREST generates them
