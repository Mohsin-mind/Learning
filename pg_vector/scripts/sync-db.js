require('dotenv').config();
const { Pool } = require('pg');
const { getActiveDimension, getActiveProviderName } = require('../src/embedding');

async function main() {
  const dim = getActiveDimension();
  const provider = getActiveProviderName();
  console.log(`Syncing DB for provider: ${provider} (${dim} dimensions)`);

  const pool = new Pool({
    host: process.env.PG_HOST,
    port: parseInt(process.env.PG_PORT),
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
  });

  try {
    await pool.query('ALTER TABLE documents DROP COLUMN IF EXISTS embedding');
    await pool.query(`ALTER TABLE documents ADD COLUMN embedding vector(${dim})`);
    console.log(`Column updated to vector(${dim})`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
