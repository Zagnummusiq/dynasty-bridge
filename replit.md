# Dynasty Bridge PWA

Online mall for electronics and home appliances based in Mumias, Kenya.

## Stack
- **Frontend**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + Framer Motion
- **Backend**: Node.js + Express 5 + PostgreSQL (pg)
- **PWA**: vite-plugin-pwa with Workbox (offline support, IndexedDB cache)

## Running the app

```bash
cd frontend && npm run dev   # starts on port 5000
```

The workflow **"Start application"** runs this automatically.

## Project structure

```
frontend/
  src/
    App.tsx                  # Main layout + product filtering logic
    components/
      CategoryBrowser.tsx    # Clickable category grid + subcategory pills
      ProductCard.tsx        # Product display with offer badges
      PromoFlyer.tsx         # Animated carousel for offers
      CartDrawer.tsx         # Slide-out cart → WhatsApp checkout
      ShopStatus.tsx         # Real-time open/closed (Africa/Nairobi TZ)
      WhatsAppBubble.tsx     # Floating WhatsApp support button
      ChatPanel.tsx          # Customer chat panel
      Logo.tsx               # SVG logo
    context/
      CartContext.tsx         # Global cart state
    data/
      categories.ts          # 9 categories × subcategories + keyword matcher
      shopProducts.ts        # Static shop floor products (edit to add/update)
    utils/
      db.ts                  # IndexedDB wrapper for offline caching
backend/
  index.js                   # Express API (GET /api/products, POST /api/orders)
  init_db.js                 # DB seed script
```

## Adding/updating shop products

Edit **`frontend/src/data/shopProducts.ts`** — each entry has:
- `id` (must be ≥ 10001 to avoid clashing with API products)
- `name`, `description`, `price` (KES)
- `category` + `subcategory` (must match an entry in `categories.ts`)
- `image_url` — replace placeholder URLs with your actual product photos
- `is_on_offer` + `discount_percentage` — controls promo flyer display

## Adding new categories or subcategories

Edit **`frontend/src/data/categories.ts`** — add to the `CATEGORIES` array.  
The `keywords` array on each subcategory controls automatic matching of API products.

## Backend

The backend (`backend/index.js`) connects to a PostgreSQL database via `DATABASE_URL`.  
Currently the Render-hosted DB URL is hardcoded as fallback. Set `DATABASE_URL` in environment secrets for production.

## PWA / Offline

- Products are cached in **IndexedDB** on first load.
- The service worker caches the app shell, images (30-day CacheFirst), and API responses (NetworkFirst with 10s timeout).
- An offline banner appears automatically when the device loses connectivity.

## User preferences
- Keep the existing design language: mustard (#FFDB58), black, zinc palette.
- Shop is located at Mumias, opposite Frankmatt Junction. Hotline: 0740930686.
- WhatsApp checkout is the primary order flow.
