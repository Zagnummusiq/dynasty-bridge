// Strictly electronics, appliances & accessories for Dynasty Bridge

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
      { name: 'Smart TVs', keywords: ['smart', 'android', 'webos', 'google tv'] },
      { name: '4K UHD', keywords: ['4k', 'ultra hd', 'uhd', 'nanocell'] },
      { name: 'Digital TVs', keywords: ['digital', 'led', 'lcd'] },
    ],
  },
  {
    name: 'Audio & Sound',
    icon: '🎵',
    subcategories: [
      { name: 'Multimedia Subwoofers', keywords: ['subwoofer', 'woofer', 'bass', 'speaker', '3.1', '2.1', '5.1'] },
      { name: 'Home Theatre', keywords: ['home theatre', 'soundbar'] },
    ],
  },
  {
    name: 'Cooking',
    icon: '🍳',
    subcategories: [
      { name: 'Gas Cookers', keywords: ['gas cooker', 'oven'] },
      { name: 'Microwaves', keywords: ['microwave'] },
    ],
  },
  {
    name: 'Refrigerators',
    icon: '🧊',
    subcategories: [
      { name: 'Double Door', keywords: ['double door'] },
      { name: 'Single Door', keywords: ['single door'] },
    ],
  },
  {
    name: 'Power & Solar',
    icon: '🔋',
    subcategories: [
      { name: 'Solar Panels', keywords: ['solar'] },
      { name: 'Inverters', keywords: ['inverter', 'battery'] },
    ],
  },
];

export const EXCLUDED_CATEGORY_KEYWORDS = [
  'fashion', 'apparel', 'clothing', 'cloth', 'wear', 'jewelry', 'beauty', 'food', 'furniture'
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
