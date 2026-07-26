const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://imanga_db_user:Ax4Fed38yJkZedTyTwCXshwEk2JVjJeR@dpg-d9hi1hkm0tmc73atrnbg-a.oregon-postgres.render.com/imanga_db',
  ssl: {
    rejectUnauthorized: false
  }
});

const EXTERNAL_PRODUCTS_URL = 'https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json';

const manualProducts = [
  {
    name: "Pioneer TS-W3020PRO Samurai Subwoofer",
    category: "Car Audio Systems",
    description: "12 Inch, 3500W Max Power, Dual 4-Ohm",
    price: 12500.00,
    image_url: "https://images.jumia.co.ke/unsafe/fit-in/500x500/filters:fill(white)/product/12/345678/1.jpg",
    stock_quantity: 10
  },
  {
    name: "Sony Bravia 55-Inch 4K UHD Smart TV",
    category: "TVs",
    description: "55 Inch, 4K UHD, Smart Android TV, HDR",
    price: 68000.00,
    image_url: "https://images.jumia.co.ke/unsafe/fit-in/500x500/filters:fill(white)/product/87/116461/1.jpg",
    stock_quantity: 5
  }
];

const initDb = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        stock_quantity INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        items JSONB NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables ensured');

    // Fetch external products
    console.log('Fetching external products...');
    const response = await axios.get(EXTERNAL_PRODUCTS_URL);
    const externalProducts = response.data.map(p => ({
      name: p.name,
      description: p.description || `High quality ${p.subCategory}`,
      price: p.priceCents / 100,
      category: p.category,
      image_url: p.image,
      stock_quantity: 20
    }));

    const allProducts = [...manualProducts, ...externalProducts];

    // Clear and re-seed to ensure latest data
    await pool.query('TRUNCATE products RESTART IDENTITY CASCADE');
    
    for (const product of allProducts) {
      await pool.query(
        'INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES ($1, $2, $3, $4, $5, $6)',
        [product.name, product.description, product.price, product.category, product.image_url, product.stock_quantity]
      );
    }
    
    console.log(`Successfully seeded ${allProducts.length} products`);
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDb();
