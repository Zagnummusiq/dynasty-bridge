const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://imanga_db_user:Ax4Fed38yJkZedTyTwCXshwEk2JVjJeR@dpg-d9hi1hkm0tmc73atrnbg-a.oregon-postgres.render.com/imanga_db',
  ssl: {
    rejectUnauthorized: false
  }
});

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
    console.log('Database tables created successfully');
    
    // Seed some initial data if empty
    const productCount = await pool.query('SELECT count(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO products (name, description, price, category, image_url, stock_quantity) VALUES
        ('Sony Smart Android TV 43"', 'Full HD, YouTube, Netflix, Prime Video', 35000, 'TVs', 'https://images.jumia.co.ke/unsafe/fit-in/500x500/filters:fill(white)/product/87/116461/1.jpg', 10),
        ('Samsung Double Door Fridge', '250L, Silver, Energy Saving', 55000, 'Fridges', 'https://images.jumia.co.ke/unsafe/fit-in/500x500/filters:fill(white)/product/56/123456/1.jpg', 5),
        ('Pioneer Subwoofer 2.1', 'Bluetooth, FM Radio, USB', 8500, 'Subwoofers', 'https://images.jumia.co.ke/unsafe/fit-in/500x500/filters:fill(white)/product/12/345678/1.jpg', 15),
        ('Gas Cylinder 6kg (Complete Set)', 'Full gas, burner, and grill', 4500, 'Gas', 'https://images.jumia.co.ke/unsafe/fit-in/500x500/filters:fill(white)/product/90/112233/1.jpg', 20);
      `);
      console.log('Initial products seeded');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
};

initDb();
