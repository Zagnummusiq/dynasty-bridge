const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL || process.env.RENDER_DB_URL;
if (!connectionString) {
  console.error('ERROR: Database connection string (DATABASE_URL or RENDER_DB_URL) is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB client error:', err.message);
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message });
  }
});

app.get('/', (req, res) => {
  res.json({ name: 'Dynasty Bridge API', status: 'live' });
});

// Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('GET /api/products error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Orders
app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, items, total_amount } = req.body;
  if (!customer_name || !customer_phone || !items || total_amount == null) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, customer_phone, items, total_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_name, customer_phone, JSON.stringify(items), total_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /api/orders error:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Dynasty Bridge API running on port ${port}`);
});
