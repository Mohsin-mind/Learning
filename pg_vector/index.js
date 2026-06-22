require('dotenv').config();

const express = require('express');
const cors = require('cors');
const documentRoutes = require('./src/routes/documents');

const app = express();
const PORT = parseInt(process.env.PORT) || 3001;

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

app.use(cors());
app.use(express.json());

app.use('/documents', documentRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'pgvector demo API',
    endpoints: ['POST /documents', 'GET /documents/search?q=...', 'GET /documents']
  });
});

app.use((err, req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
