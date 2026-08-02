const { Pool } = require('pg');
const axios = require('axios');
require('dotenv').config();

const connectionString = process.env.RENDER_DB_URL;
if (!connectionString) {
  console.error('ERROR: RENDER_DB_URL is not set. Aborting.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const EXTERNAL_PRODUCTS_URL = 'https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json';

const manualProducts = [
  {
    name: "Royal Sound RS-200 Multimedia Subwoofer",
    category: "Home Audio",
    description: "3.1 Channel Multimedia Speaker System, High Bass, Bluetooth/USB/FM",
    price: 8500.00,
    image_url: "/products/subwoofer-1.jpg",
    stock_quantity: 15,
    is_on_offer: true,
    discount_percentage: 10
  },
  {
    name: "Dynasty X-Bass 3.1 Subwoofer System",
    category: "Home Audio",
    description: "Premium X-Bass technology, LED Display, Remote Control",
    price: 9200.00,
    image_url: "/products/subwoofer-2.jpg",
    stock_quantity: 12,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Supreme Audio S-500 Multimedia Speaker",
    category: "Home Audio",
    description: "5.1 Virtual Surround Sound, Powerful Bass, Wireless Connectivity",
    price: 9800.00,
    image_url: "/products/subwoofer-3.jpg",
    stock_quantity: 8,
    is_on_offer: true,
    discount_percentage: 5
  },
  {
    name: "Dynasty Smart LED TV 32\"",
    category: "TVs",
    description: "32 Inch Smart Android LED TV, Netflix/YouTube, Narrow Bezel",
    price: 16500.00,
    image_url: "/products/tv-1.jpg",
    stock_quantity: 10,
    is_on_offer: true,
    discount_percentage: 12
  },
  {
    name: "Dynasty 4K Ultra HD Smart TV 43\"",
    category: "TVs",
    description: "43 Inch 4K UHD Smart TV, HDR10, Frameless Design",
    price: 28500.00,
    image_url: "/products/tv-2.jpg",
    stock_quantity: 6,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Sony 55\" 4K HDR Google TV",
    category: "TVs",
    description: "Premium 55 Inch 4K Display, Google TV, Immersive Sound",
    price: 64000.00,
    image_url: "/products/tv-1.jpg",
    stock_quantity: 4,
    is_on_offer: true,
    discount_percentage: 8
  },
  {
    name: "Pioneer TS-W3020PRO Samurai Subwoofer",
    category: "Car Audio Systems",
    description: "12 Inch, 3500W Max Power, Dual 4-Ohm",
    price: 12500.00,
    image_url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&auto=format&fit=crop",
    stock_quantity: 10,
    is_on_offer: true,
    discount_percentage: 15
  }
];

const initDb = async () => {
  try {
    console.log('Dropping existing products table...');
    await pool.query('DROP TABLE IF EXISTS products CASCADE');

    console.log('Creating products table...');
    await pool.query(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT,
        stock_quantity INTEGER DEFAULT 0,
        is_on_offer BOOLEAN DEFAULT false,
        discount_percentage INTEGER DEFAULT 0
      )
    `);

    console.log('Ensuring orders table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        items JSONB NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Fetching external products...');
    let externalProducts = [];
    try {
      const response = await axios.get(EXTERNAL_PRODUCTS_URL, { timeout: 10000 });
      const filtered = response.data.filter(p => {
        const cat = p.category.toLowerCase();
        return cat.includes('electronics') || cat.includes('gadgets') || (cat.includes('home') && !cat.includes('decor'));
      });
      externalProducts = filtered.map((p, i) => ({
        name: p.name,
        description: p.description || `High quality ${p.subCategory}`,
        price: p.priceCents / 100,
        category: p.category,
        image_url: p.image,
        stock_quantity: 20,
        is_on_offer: i % 3 === 0,
        discount_percentage: i % 3 === 0 ? 12 : 0
      }));
      console.log(`Fetched ${externalProducts.length} external products.`);
    } catch (err) {
      console.warn('Could not fetch external products, seeding with manual only:', err.message);
    }

    const allProducts = [...manualProducts, ...externalProducts];

    console.log(`Seeding ${allProducts.length} products...`);
    for (const product of allProducts) {
      await pool.query(
        'INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_on_offer, discount_percentage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [product.name, product.description, product.price, product.category, product.image_url, product.stock_quantity, product.is_on_offer || false, product.discount_percentage || 0]
      );
    }

    console.log('Database initialised successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initialising database:', err.message);
    process.exit(1);
  }
};

initDb();
