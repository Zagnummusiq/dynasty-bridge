// Strictly electronics, appliances & accessories — no fashion or apparel

export interface Subcategory {
  name: string;
  keywords: string[];
}

export interface Category {
  name: string;
  icon: string;
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    name: 'Televisions',
    icon: '📺',
    subcategories: [
      { name: 'Smart & Android TVs', keywords: ['smart tv', 'android tv'] },
      { name: 'LED & OLED TVs', keywords: ['led tv', 'oled', 'qled', 'television', 'tv'] },
      { name: 'Mini & Portable TVs', keywords: ['mini tv', 'portable tv'] },
    ],
  },
  {
    name: 'Refrigerators',
    icon: '🧊',
    subcategories: [
      { name: 'Double Door', keywords: ['double door', 'frost free'] },
      { name: 'Single Door', keywords: ['single door', 'single fridge'] },
      { name: 'Bar Fridges', keywords: ['bar fridge', 'mini fridge'] },
    ],
  },
  {
    name: 'Cooking',
    icon: '🍳',
    subcategories: [
      { name: 'Gas Cookers', keywords: ['gas cooker', 'gas stove', 'gas oven'] },
      { name: 'Electric Cookers', keywords: ['electric cooker', 'electric stove', 'induction'] },
      { name: 'Microwaves', keywords: ['microwave'] },
      { name: 'Blenders & Mixers', keywords: ['blender', 'mixer', 'juicer', 'food processor'] },
      { name: 'Rice Cookers', keywords: ['rice cooker', 'pressure cooker'] },
    ],
  },
  {
    name: 'Audio & Sound',
    icon: '🎵',
    subcategories: [
      { name: 'Home Theatre', keywords: ['home theatre', 'home theater', 'soundbar'] },
      { name: 'Woofers', keywords: ['woofer', 'subwoofer', 'bass'] },
      { name: 'Bluetooth Speakers', keywords: ['bluetooth speaker', 'wireless speaker', 'portable speaker'] },
      { name: 'Car Audio', keywords: ['car audio', 'car speaker', 'car stereo', 'amplifier'] },
    ],
  },
  {
    name: 'Phones & Tablets',
    icon: '📱',
    subcategories: [
      { name: 'Smartphones', keywords: ['smartphone', 'android phone', 'iphone', 'mobile'] },
      { name: 'Tablets', keywords: ['tablet', 'ipad'] },
      { name: 'Phone Accessories', keywords: ['charger', 'earphone', 'headphone', 'earbuds', 'phone case'] },
    ],
  },
  {
    name: 'Fans & Lighting',
    icon: '💡',
    subcategories: [
      { name: 'Fans', keywords: ['ceiling fan', 'stand fan', 'floor fan', 'wall fan'] },
      { name: 'LED Bulbs & Tubes', keywords: ['led bulb', 'bulb', 'tube', 'fluorescent'] },
      { name: 'Solar Lights', keywords: ['solar light', 'solar lamp', 'solar lantern'] },
    ],
  },
  {
    name: 'Laundry',
    icon: '🧺',
    subcategories: [
      { name: 'Washing Machines', keywords: ['washing machine', 'washer', 'front load', 'top load'] },
      { name: 'Electric Irons', keywords: ['iron', 'steam iron'] },
    ],
  },
  {
    name: 'Power & Solar',
    icon: '🔋',
    subcategories: [
      { name: 'Solar Panels', keywords: ['solar panel', 'solar kit'] },
      { name: 'Inverters & UPS', keywords: ['inverter', 'ups', 'power backup'] },
      { name: 'Batteries', keywords: ['battery', 'deep cycle'] },
      { name: 'Extension Cables', keywords: ['extension', 'power strip', 'cable'] },
    ],
  },
  {
    name: 'Computing',
    icon: '💻',
    subcategories: [
      { name: 'Laptops', keywords: ['laptop', 'notebook', 'chromebook'] },
      { name: 'Printers', keywords: ['printer', 'scanner', 'copier'] },
      { name: 'Computer Accessories', keywords: ['keyboard', 'mouse', 'monitor', 'webcam'] },
    ],
  },
  {
    name: 'Car Electronics',
    icon: '🚗',
    subcategories: [
      { name: 'Car Audio', keywords: ['car audio', 'car speaker', 'car stereo'] },
      { name: 'Car Accessories', keywords: ['car charger', 'dash cam', 'car alarm'] },
    ],
  },
];

// Categories that should NEVER appear — fashion, apparel, beauty, etc.
export const EXCLUDED_CATEGORY_KEYWORDS = [
  'fashion', 'apparel', 'clothing', 'cloth', 'wear',
  "men's clothing", "women's clothing", "kids' clothing",
  'jewelery', 'jewelry', 'jewellery',
  'beauty', 'cosmetic', 'makeup', 'fragrance', 'perfume',
  'health & beauty', 'personal care',
  'sport', 'outdoor', 'fitness',
  'garden', 'gardening', 'plant',
  'office supplies', 'stationery',
  'books', 'music', 'movies', 'toys', 'games',
  'food', 'grocery', 'beverages',
  'furniture', 'decor', 'art', 'craft',
  'pet', 'baby clothing',
];

export function isExcludedCategory(category: string): boolean {
  const lc = category.toLowerCase();
  return EXCLUDED_CATEGORY_KEYWORDS.some(kw => lc.includes(kw));
}

export function matchSubcategory(name: string, apiCategory: string): { category: string; subcategory: string } | null {
  const haystack = `${name} ${apiCategory}`.toLowerCase();
  for (const cat of CATEGORIES) {
    for (const sub of cat.subcategories) {
      if (sub.keywords.some(k => haystack.includes(k))) {
        return { category: cat.name, subcategory: sub.name };
      }
    }
  }
  return null;
}
