const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://imanga_db_user:Ax4Fed38yJkZedTyTwCXshwEk2JVjJeR@dpg-d9hi1hkm0tmc73atrnbg-a.oregon-postgres.render.com/imanga_db',
  ssl: {
    rejectUnauthorized: false
  }
});

app.get('/', (req, res) => {
  res.send('Dynasty Bridge Backend API is Live! Shop is tracking Kenya Time.');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customer_name, customer_phone, items, total_amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, customer_phone, items, total_amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [customer_name, customer_phone, JSON.stringify(items), total_amount]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
