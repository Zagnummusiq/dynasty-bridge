const { Pool } = require('pg');
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

const manualProducts = [
  // ── MULTIMEDIA SUBWOOFERS (8,000 - 10,000 KES) ──────────────────────────────
  {
    name: "Dynasty Mega Bass 3.1 Subwoofer",
    category: "Audio & Sound",
    description: "High-performance 3.1 channel system with deep bass technology.",
    price: 8200.00,
    image_url: "/products/20260802_100145.jpg",
    stock_quantity: 15,
    is_on_offer: true,
    discount_percentage: 10
  },
  {
    name: "Royal Sound R-10 Multimedia Speaker",
    category: "Audio & Sound",
    description: "Premium sound quality with Bluetooth, FM, and USB support.",
    price: 8500.00,
    image_url: "/products/20260802_100151.jpg",
    stock_quantity: 12,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Supreme Audio S-X1 Woofer",
    category: "Audio & Sound",
    description: "Compact yet powerful subwoofer for immersive home audio.",
    price: 8800.00,
    image_url: "/products/20260802_100157.jpg",
    stock_quantity: 10,
    is_on_offer: true,
    discount_percentage: 5
  },
  {
    name: "Sony-Style Premium Subwoofer",
    category: "Audio & Sound",
    description: "Inspired by premium engineering for crystal clear low frequencies.",
    price: 9200.00,
    image_url: "/products/20260802_100205.jpg",
    stock_quantity: 8,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Dynasty Pro-Sound 5.1 System",
    category: "Audio & Sound",
    description: "Full surround sound experience with dedicated active subwoofer.",
    price: 9800.00,
    image_url: "/products/20260802_100213.jpg",
    stock_quantity: 5,
    is_on_offer: true,
    discount_percentage: 12
  },
  {
    name: "Digital X-Bass Multimedia Speaker",
    category: "Audio & Sound",
    description: "Digital display and remote control for the ultimate bass control.",
    price: 8400.00,
    image_url: "/products/20260802_100236.jpg",
    stock_quantity: 20,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "UltraLink 3.1 Home Theatre",
    category: "Audio & Sound",
    description: "Seamlessly link your devices for a cinematic audio experience.",
    price: 8900.00,
    image_url: "/products/20260802_100245.jpg",
    stock_quantity: 14,
    is_on_offer: true,
    discount_percentage: 8
  },
  {
    name: "Pioneer Samurai Special Woofer",
    category: "Audio & Sound",
    description: "Limited edition Samurai series with unmatched durability.",
    price: 9500.00,
    image_url: "/products/20260802_100250.jpg",
    stock_quantity: 6,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Dynasty Compact Bass 2.1",
    category: "Audio & Sound",
    description: "Space-saving design without compromising on sound impact.",
    price: 8100.00,
    image_url: "/products/20260802_100257.jpg",
    stock_quantity: 25,
    is_on_offer: true,
    discount_percentage: 15
  },
  {
    name: "High-Performance Multimedia System",
    category: "Audio & Sound",
    description: "Engineered for high fidelity and consistent bass response.",
    price: 8700.00,
    image_url: "/products/20260802_100303.jpg",
    stock_quantity: 11,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Sonic Boom 3.1 Subwoofer",
    category: "Audio & Sound",
    description: "Bring the party home with the Sonic Boom audio technology.",
    price: 9100.00,
    image_url: "/products/20260802_100311.jpg",
    stock_quantity: 9,
    is_on_offer: true,
    discount_percentage: 10
  },
  {
    name: "Dynasty Elite Soundbar + Woofer",
    category: "Audio & Sound",
    description: "Sleek soundbar design paired with a heavy-duty subwoofer.",
    price: 9900.00,
    image_url: "/products/20260802_100319.jpg",
    stock_quantity: 4,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Bose-Type Crystal Clear Audio",
    category: "Audio & Sound",
    description: "Premium clarity for both music and movies.",
    price: 9400.00,
    image_url: "/products/20260802_100326.jpg",
    stock_quantity: 7,
    is_on_offer: true,
    discount_percentage: 5
  },
  {
    name: "Massive Power Multimedia Speaker",
    category: "Audio & Sound",
    description: "Unrivaled power output for large living rooms.",
    price: 8600.00,
    image_url: "/products/20260802_100332.jpg",
    stock_quantity: 18,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Dynasty X-Series 3.1",
    category: "Audio & Sound",
    description: "The next generation of Dynasty audio engineering.",
    price: 9300.00,
    image_url: "/products/20260802_100337.jpg",
    stock_quantity: 12,
    is_on_offer: true,
    discount_percentage: 10
  },
  {
    name: "Royal Bass Premium System",
    category: "Audio & Sound",
    description: "Feel the royalty in every beat with Royal Bass.",
    price: 8300.00,
    image_url: "/products/20260802_100346.jpg",
    stock_quantity: 16,
    is_on_offer: false,
    discount_percentage: 0
  },

  // ── SMART TVs (ESTIMATED PRICES) ───────────────────────────────────────────
  {
    name: "Dynasty 24\" LED Digital TV",
    category: "Televisions",
    description: "Perfect for kitchens or small rooms, clear digital reception.",
    price: 12500.00,
    image_url: "/products/20260802_100352.jpg",
    stock_quantity: 10,
    is_on_offer: true,
    discount_percentage: 5
  },
  {
    name: "Dynasty 32\" Smart Android TV",
    category: "Televisions",
    description: "Access Netflix, YouTube, and more with our best-selling smart TV.",
    price: 16800.00,
    image_url: "/products/20260802_100359.jpg",
    stock_quantity: 15,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Vitron 32\" Frameless Smart TV",
    category: "Televisions",
    description: "Elegant frameless design with built-in Wi-Fi and apps.",
    price: 17500.00,
    image_url: "/products/20260802_100408.jpg",
    stock_quantity: 12,
    is_on_offer: true,
    discount_percentage: 10
  },
  {
    name: "Dynasty 40\" Full HD Smart TV",
    category: "Televisions",
    description: "Brilliant Full HD resolution with smart functionality.",
    price: 24500.00,
    image_url: "/products/20260802_100414.jpg",
    stock_quantity: 8,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "TCL 40\" Android TV",
    category: "Televisions",
    description: "Trusted global brand quality with smooth Android OS.",
    price: 26000.00,
    image_url: "/products/20260802_100426.jpg",
    stock_quantity: 6,
    is_on_offer: true,
    discount_percentage: 12
  },
  {
    name: "Dynasty 43\" 4K UHD Smart TV",
    category: "Televisions",
    description: "Ultra High Definition for incredible detail and color.",
    price: 29800.00,
    image_url: "/products/20260802_100449.jpg",
    stock_quantity: 5,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Samsung 43\" Crystal UHD TV",
    category: "Televisions",
    description: "Premium Samsung quality with Crystal Processor 4K.",
    price: 48000.00,
    image_url: "/products/20260802_100456.jpg",
    stock_quantity: 3,
    is_on_offer: true,
    discount_percentage: 8
  },
  {
    name: "Dynasty 50\" 4K Ultra Smart TV",
    category: "Televisions",
    description: "Large screen 4K UHD with HDR support.",
    price: 38500.00,
    image_url: "/products/20260802_100507.jpg",
    stock_quantity: 4,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Hisense 50\" A6 series 4K",
    category: "Televisions",
    description: "Hisense quality with sleek design and Dolby Vision.",
    price: 45000.00,
    image_url: "/products/20260802_100512.jpg",
    stock_quantity: 4,
    is_on_offer: true,
    discount_percentage: 10
  },
  {
    name: "Dynasty 55\" 4K WebOS Smart TV",
    category: "Televisions",
    description: "Advanced WebOS interface for the most intuitive TV experience.",
    price: 46500.00,
    image_url: "/products/20260802_100519.jpg",
    stock_quantity: 3,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Sony 55\" X80K 4K Google TV",
    category: "Televisions",
    description: "Unmatched Sony Bravia quality with Google TV smarts.",
    price: 68000.00,
    image_url: "/products/20260802_100525.jpg",
    stock_quantity: 2,
    is_on_offer: true,
    discount_percentage: 15
  },
  {
    name: "Dynasty 65\" Giant 4K Smart TV",
    category: "Televisions",
    description: "The centerpiece of your home theatre. Huge 65-inch screen.",
    price: 62000.00,
    image_url: "/products/20260802_100534.jpg",
    stock_quantity: 2,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "LG 65\" NanoCell 4K TV",
    category: "Televisions",
    description: "LG's NanoCell technology for pure color and sharp 4K.",
    price: 85000.00,
    image_url: "/products/20260802_100543.jpg",
    stock_quantity: 1,
    is_on_offer: true,
    discount_percentage: 10
  },
  {
    name: "Dynasty Premium 32\" LED TV",
    category: "Televisions",
    description: "High durability and low power consumption.",
    price: 14500.00,
    image_url: "/products/20260802_100554.jpg",
    stock_quantity: 10,
    is_on_offer: false,
    discount_percentage: 0
  },
  {
    name: "Skyworth 43\" Smart Android",
    category: "Televisions",
    description: "Vibrant colors and powerful Android OS.",
    price: 28000.00,
    image_url: "/products/20260802_100603.jpg",
    stock_quantity: 5,
    is_on_offer: true,
    discount_percentage: 5
  },
  {
    name: "Dynasty 43\" Frameless 4K",
    category: "Televisions",
    description: "Sleek look with high resolution for modern homes.",
    price: 31000.00,
    image_url: "/products/20260802_100626.jpg",
    stock_quantity: 8,
    is_on_offer: false,
    discount_percentage: 0
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

    console.log(`Seeding ${manualProducts.length} products...`);
    for (const product of manualProducts) {
      await pool.query(
        'INSERT INTO products (name, description, price, category, image_url, stock_quantity, is_on_offer, discount_percentage) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [product.name, product.description, product.price, product.category, product.image_url, product.stock_quantity, product.is_on_offer || false, product.discount_percentage || 0]
      );
    }

    console.log('Database initialised successfully with ONLY uploaded Dynasty products.');
    process.exit(0);
  } catch (err) {
    console.error('Error initialising database:', err.message);
    process.exit(1);
  }
};

initDb();
