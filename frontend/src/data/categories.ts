// Category and subcategory definitions for Dynasty Bridge
// Subcategory keywords are used to match API products automatically

export interface Subcategory {
  name: string;
  keywords: string[];
}

export interface Category {
  name: string;
  icon: string;
  accent: string; // Tailwind bg class for hover
  subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
  {
    name: 'Televisions',
    icon: '📺',
    accent: 'bg-blue-50 border-blue-200',
    subcategories: [
      { name: 'Smart TVs', keywords: ['smart tv', 'android tv', 'smart television'] },
      { name: 'LED & OLED TVs', keywords: ['led tv', 'oled', 'qled', 'television', 'tv'] },
      { name: 'Mini & Portable TVs', keywords: ['mini tv', 'portable tv', 'small tv'] },
    ],
  },
  {
    name: 'Refrigerators',
    icon: '🧊',
    accent: 'bg-cyan-50 border-cyan-200',
    subcategories: [
      { name: 'Single Door Fridges', keywords: ['single door', 'single fridge'] },
      { name: 'Double Door Fridges', keywords: ['double door', 'double fridge', 'frost free'] },
      { name: 'Bar Fridges', keywords: ['bar fridge', 'mini fridge', 'bar refrigerator'] },
      { name: 'Side-by-Side', keywords: ['side by side', 'french door'] },
    ],
  },
  {
    name: 'Cooking',
    icon: '🍳',
    accent: 'bg-orange-50 border-orange-200',
    subcategories: [
      { name: 'Gas Cookers', keywords: ['gas cooker', 'gas stove', 'gas oven'] },
      { name: 'Electric Cookers', keywords: ['electric cooker', 'electric stove', 'induction'] },
      { name: 'Microwaves', keywords: ['microwave', 'microwave oven'] },
      { name: 'Blenders & Mixers', keywords: ['blender', 'mixer', 'juicer', 'food processor'] },
      { name: 'Rice Cookers', keywords: ['rice cooker', 'pressure cooker'] },
    ],
  },
  {
    name: 'Audio & Sound',
    icon: '🎵',
    accent: 'bg-purple-50 border-purple-200',
    subcategories: [
      { name: 'Home Theatre', keywords: ['home theatre', 'home theater', 'surround sound', 'soundbar'] },
      { name: 'Woofers & Subwoofers', keywords: ['woofer', 'subwoofer', 'bass'] },
      { name: 'Bluetooth Speakers', keywords: ['bluetooth speaker', 'portable speaker', 'wireless speaker'] },
      { name: 'Car Audio', keywords: ['car audio', 'car speaker', 'car stereo', 'amplifier', 'subwoofer'] },
    ],
  },
  {
    name: 'Phones & Tablets',
    icon: '📱',
    accent: 'bg-green-50 border-green-200',
    subcategories: [
      { name: 'Smartphones', keywords: ['smartphone', 'android phone', 'iphone', 'mobile phone'] },
      { name: 'Tablets', keywords: ['tablet', 'ipad', 'android tablet'] },
      { name: 'Accessories', keywords: ['phone case', 'charger', 'earphone', 'headphone', 'earbuds'] },
    ],
  },
  {
    name: 'Fans & Lighting',
    icon: '💡',
    accent: 'bg-yellow-50 border-yellow-200',
    subcategories: [
      { name: 'Ceiling & Stand Fans', keywords: ['ceiling fan', 'stand fan', 'floor fan', 'fan'] },
      { name: 'LED Bulbs & Tubes', keywords: ['led bulb', 'led tube', 'fluorescent', 'bulb', 'light'] },
      { name: 'Solar Lights', keywords: ['solar light', 'solar lamp', 'solar lantern'] },
    ],
  },
  {
    name: 'Laundry',
    icon: '🧺',
    accent: 'bg-pink-50 border-pink-200',
    subcategories: [
      { name: 'Washing Machines', keywords: ['washing machine', 'washer', 'front load', 'top load'] },
      { name: 'Electric Irons', keywords: ['electric iron', 'steam iron', 'iron'] },
    ],
  },
  {
    name: 'Power & Solar',
    icon: '🔋',
    accent: 'bg-lime-50 border-lime-200',
    subcategories: [
      { name: 'Solar Panels', keywords: ['solar panel', 'solar kit', 'solar system'] },
      { name: 'Inverters & Batteries', keywords: ['inverter', 'battery', 'ups', 'power backup'] },
      { name: 'Extension Cables', keywords: ['extension', 'extension cord', 'power strip', 'cable'] },
    ],
  },
  {
    name: 'Computing',
    icon: '💻',
    accent: 'bg-indigo-50 border-indigo-200',
    subcategories: [
      { name: 'Laptops', keywords: ['laptop', 'notebook', 'chromebook'] },
      { name: 'Printers & Scanners', keywords: ['printer', 'scanner', 'copier'] },
      { name: 'Computer Accessories', keywords: ['keyboard', 'mouse', 'monitor', 'headset', 'webcam'] },
    ],
  },
];

// Given a product name + category string, find the best matching subcategory
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
