// ─────────────────────────────────────────────────────────────────────────────
// DYNASTY BRIDGE — Shop Floor Products
// ─────────────────────────────────────────────────────────────────────────────
// This file is now empty to ensure only database-driven uploaded appliances 
// are displayed, as requested.
// ─────────────────────────────────────────────────────────────────────────────

export interface ShopProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  image_url: string;
  stock_quantity: number;
  is_on_offer: boolean;
  discount_percentage: number;
  source: 'shop';
}

export const SHOP_PRODUCTS: ShopProduct[] = [];
