import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Phone, MapPin, X, SlidersHorizontal } from 'lucide-react';
import Logo from './components/Logo';
import ShopStatus from './components/ShopStatus';
import ProductCard from './components/ProductCard';
import WhatsAppBubble from './components/WhatsAppBubble';
import ChatPanel from './components/ChatPanel';
import CartDrawer from './components/CartDrawer';
import HeroBanner from './components/HeroBanner';
import FlashDeals from './components/FlashDeals';
import type { Product } from './context/CartContext';
import { useCart } from './context/CartContext';
import { getCachedProducts, syncProductsToCache } from './utils/db';
import { SHOP_PRODUCTS } from './data/shopProducts';
import { CATEGORIES, matchSubcategory, isExcludedCategory } from './data/categories';

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'offers', label: 'Offers First' },
];

const App: React.FC = () => {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { cart } = useCart();

  const API_URL = import.meta.env.VITE_API_URL || '';

  // ── Online/offline detection ─────────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  // ── Load products ────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const cached = await getCachedProducts();
        const cachedApi = cached.filter(p => p.id < 10000);
        if (cachedApi.length > 0) { setApiProducts(cachedApi); setIsLoading(false); }
      } catch { /* ignore */ }

      try {
        const res = await axios.get(`${API_URL}/api/products`, { timeout: 10000 });
        const fresh: Product[] = (res.data as Product[])
          .filter(p => !isExcludedCategory(p.category))  // strictly no fashion/apparel
          .map(p => {
            const match = matchSubcategory(p.name, p.category);
            return { ...p, source: 'api' as const, category: match?.category ?? p.category, subcategory: match?.subcategory };
          });
        setApiProducts(fresh);
        await syncProductsToCache(fresh);
      } catch (err) {
        console.warn('API unavailable, using cached/shop data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // ── Merge shop + API products ────────────────────────────────────────────
  const allProducts = useMemo<Product[]>(() => {
    const shopIds = new Set(SHOP_PRODUCTS.map(p => p.id));
    return [...(SHOP_PRODUCTS as Product[]), ...apiProducts.filter(p => !shopIds.has(p.id))];
  }, [apiProducts]);

  // ── Filter + sort ────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (searchTerm.trim()) {
      const t = searchTerm.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(t) || p.description?.toLowerCase().includes(t) || p.category?.toLowerCase().includes(t));
    }
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    if (selectedSubcategory) list = list.filter(p => p.subcategory === selectedSubcategory);

    if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (sortBy === 'offers') list = [...list].sort((a, b) => (b.is_on_offer ? 1 : 0) - (a.is_on_offer ? 1 : 0));

    return list;
  }, [allProducts, searchTerm, selectedCategory, selectedSubcategory, sortBy]);

  const offerProducts = useMemo(() => allProducts.filter(p => p.is_on_offer && p.discount_percentage && p.discount_percentage > 0), [allProducts]);

  // Subcategories for selected category
  const subcategories = useMemo(() => {
    const cat = CATEGORIES.find(c => c.name === selectedCategory);
    if (!cat) return [];
    return cat.subcategories.filter(sub => allProducts.some(p => p.subcategory === sub.name));
  }, [selectedCategory, allProducts]);

  const clearFilters = () => { setSelectedCategory(''); setSelectedSubcategory(''); setSearchTerm(''); setSortBy('default'); };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('');
    setSearchTerm('');
    document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">

      {/* ── Offline banner ── */}
      {isOffline && (
        <div className="bg-amber-400 text-black text-[11px] font-bold text-center py-1.5 px-4 uppercase tracking-widest">
          ⚡ You're offline — browsing cached products
        </div>
      )}

      {/* ── Announcement bar ── */}
      <div className="bg-zinc-900 text-white text-[11px] py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ShopStatus />
            <span className="flex items-center gap-1"><MapPin size={10} /> Mumias, opposite Frankmatt Junction</span>
          </div>
          <a href="tel:0740930686" className="flex items-center gap-1 hover:text-mustard transition-colors">
            <Phone size={10} /> 0740930686
          </a>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Logo */}
          <Logo className="h-10 w-auto flex-shrink-0" />

          {/* Search bar */}
          <div className="flex flex-1 rounded-sm overflow-hidden border-2 border-mustard">
            <input
              type="text"
              placeholder="Search TVs, fridges, solar panels, speakers..."
              className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setSelectedCategory(''); setSelectedSubcategory(''); }}
            />
            <button
              className="bg-mustard px-5 py-2.5 font-bold flex items-center gap-2 hover:opacity-90 transition-opacity flex-shrink-0"
              onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Search size={18} />
            </button>
          </div>

          {/* Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-sm hover:bg-zinc-700 transition-colors flex-shrink-0"
          >
            <div className="relative">
              <ShoppingCart size={20} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
            <span className="text-sm font-bold hidden sm:inline">Cart</span>
          </button>
        </div>

        {/* ── Category nav bar ── */}
        <div className="bg-zinc-800 border-t border-zinc-700">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={clearFilters}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-bold transition-colors flex-shrink-0 ${
                  !selectedCategory ? 'bg-mustard text-black' : 'text-white hover:bg-zinc-700'
                }`}
              >
                🏠 All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-xs font-bold transition-colors flex-shrink-0 ${
                    selectedCategory === cat.name ? 'bg-mustard text-black' : 'text-white hover:bg-zinc-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <HeroBanner onShopCategory={handleCategorySelect} />

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4 flex flex-col gap-4">

        {/* Flash deals */}
        {offerProducts.length > 0 && <FlashDeals products={offerProducts} />}

        {/* ── Shop by Category grid ── */}
        {!selectedCategory && !searchTerm && (
          <div className="bg-white shadow-sm rounded-sm p-4">
            <h2 className="font-black text-base mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-mustard rounded-full inline-block"></span>
              Shop by Category
            </h2>
            <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-10 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className="flex flex-col items-center gap-1.5 py-3 px-1 rounded hover:bg-amber-50 transition-colors group"
                >
                  <span className="text-3xl leading-none">{cat.icon}</span>
                  <span className="text-[10px] text-center text-zinc-600 group-hover:text-black font-medium leading-tight">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Products section ── */}
        <div id="products-grid" className="bg-white shadow-sm rounded-sm overflow-hidden">

          {/* Section header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <h2 className="font-black text-sm flex items-center gap-2">
              <span className="w-1 h-5 bg-mustard rounded-full inline-block"></span>
              {searchTerm
                ? `Results for "${searchTerm}"`
                : selectedCategory
                ? selectedCategory
                : 'All Products'}
              <span className="text-zinc-400 font-normal text-xs">({filteredProducts.length})</span>
            </h2>

            <div className="flex items-center gap-2">
              {/* Sort */}
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs border border-zinc-200 rounded px-2 py-1 outline-none bg-white"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {/* Clear */}
              {(selectedCategory || searchTerm || sortBy !== 'default') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs text-red-500 font-bold border border-red-200 rounded px-2 py-1 hover:bg-red-50"
                >
                  <X size={11} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Subcategory pills */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="flex gap-2 px-4 py-2.5 border-b border-zinc-100 overflow-x-auto scrollbar-hide bg-zinc-50">
              <button
                onClick={() => setSelectedSubcategory('')}
                className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-colors flex-shrink-0 ${
                  !selectedSubcategory ? 'bg-mustard text-black border-mustard' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                All {selectedCategory}
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub.name}
                  onClick={() => setSelectedSubcategory(sub.name)}
                  className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold border transition-colors flex-shrink-0 ${
                    selectedSubcategory === sub.name ? 'bg-black text-white border-black' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          {/* Product grid */}
          {isLoading && allProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-4 border-mustard border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-400 text-sm">Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-zinc-100">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-400">
              <span className="text-5xl mb-4">🔍</span>
              <p className="font-medium mb-2">No products found</p>
              <button onClick={clearFilters} className="text-xs text-mustard font-bold underline">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-zinc-900 text-white mt-8 py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Logo className="h-8 w-auto mb-4" />
            <p className="text-zinc-400 text-sm leading-relaxed">
              Mumias' leading electronics & home appliances hub. Quality products, best prices.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Contact</h4>
            <div className="flex items-center gap-2 text-sm text-zinc-300"><Phone size={14} /> 0740930686</div>
            <div className="flex items-center gap-2 text-sm text-zinc-300"><MapPin size={14} /> Opposite Frankmatt Junction, Mumias</div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Categories</h4>
            <div className="grid grid-cols-2 gap-1">
              {CATEGORIES.slice(0, 8).map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { handleCategorySelect(cat.name); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-xs text-zinc-400 hover:text-mustard text-left transition-colors"
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-zinc-800 mt-8 pt-6 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
          © 2026 Dynasty Bridge. All rights reserved. Mumias, Kakamega.
        </div>
      </footer>

      <WhatsAppBubble />
      <ChatPanel />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default App;
