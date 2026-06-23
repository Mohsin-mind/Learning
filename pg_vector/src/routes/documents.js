const { Router } = require('express');
const pool = require('../db');
const { generateEmbedding } = require('../embedding');
const slugify = require('slugify');

const router = Router();

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post('/', asyncHandler(async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'title and content are required' });
  }

  const embedding = await generateEmbedding(content);
  const baseSlug = slugify(title, { lower: true, strict: true });

  const result = await pool.query(
    `INSERT INTO documents (title, slug, content, embedding)
     VALUES ($1, $2 || '-' || nextval('documents_slug_seq')::TEXT, $3, $4)
     RETURNING id, title, slug, content, created_at`,
    [title, baseSlug, content, JSON.stringify(embedding)]
  );

  res.status(201).json(result.rows[0]);
}));

router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit, match, threshold } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'query parameter q is required' });
  }

  const embedding = await generateEmbedding(q);
  const maxResults = Math.min(parseInt(limit) || 10, 50);
  const distThreshold = parseFloat(threshold) || 2.0;

  let query;
  if (match === 'true') {
    query = `
      SELECT id, title, slug, content, created_at,
             embedding <-> $1::vector AS distance
      FROM documents
      WHERE embedding <-> $1::vector < $2
      ORDER BY distance
      LIMIT $3
    `;
  } else {
    query = `
      SELECT id, title, slug, content, created_at,
             embedding <-> $1::vector AS distance
      FROM documents
      ORDER BY distance
      LIMIT $2
    `;
  }

  const params = match === 'true'
    ? [JSON.stringify(embedding), distThreshold, maxResults]
    : [JSON.stringify(embedding), maxResults];

  const result = await pool.query(query, params);

  res.json(result.rows);
}));

router.get('/', asyncHandler(async (req, res) => {
  const result = await pool.query(
    'SELECT id, title, slug, content, created_at FROM documents ORDER BY created_at DESC'
  );
  res.json(result.rows);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query(
    'DELETE FROM documents WHERE id = $1 RETURNING id, title, slug',
    [id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Document not found' });
  }
  res.json({ message: 'Deleted', document: result.rows[0] });
}));

router.delete('/', asyncHandler(async (req, res) => {
  const result = await pool.query('DELETE FROM documents RETURNING id');
  res.json({ message: `Deleted ${result.rows.length} document(s)` });
}));

module.exports = router;
