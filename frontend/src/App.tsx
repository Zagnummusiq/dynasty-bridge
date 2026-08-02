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
    // Smooth scroll to the products grid
    const grid = document.getElementById('products-grid');
    if (grid) {
      const navHeight = 120; // approximate height of sticky nav
      const elementPosition = grid.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-['Montserrat']">

      {/* ── Offline banner ── */}
      {isOffline && (
        <div className="bg-amber-400 text-black text-[11px] font-bold text-center py-1.5 px-4 uppercase tracking-widest">
          ⚡ You're offline — browsing cached products
        </div>
      )}

      {/* ── Announcement bar ── */}
      <div className="bg-brand-navy text-white/60 text-[11px] py-2 px-6 border-b border-white/5 uppercase tracking-widest font-bold">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ShopStatus />
            <span className="hidden md:flex items-center gap-1"><MapPin size={10} /> Mumias, opposite Frankmatt Junction</span>
          </div>
          <a href="tel:0740930686" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone size={10} /> 0740930686
          </a>
        </div>
      </div>

      {/* ── Main header ── */}
      <header className="bg-brand-navy shadow-lg sticky top-0 z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-8">
          {/* Logo */}
          <Logo className="h-10 w-auto flex-shrink-0" />

          {/* Search bar */}
          <div className="hidden lg:flex flex-1 items-center bg-white/10 rounded-full px-4 py-2 border border-white/5 focus-within:border-white/20 transition-colors">
            <Search size={18} className="text-white/40" />
            <input
              type="text"
              placeholder="Search smart TVs, subwoofers, fridges..."
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-white placeholder:text-white/30"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setSelectedCategory(''); setSelectedSubcategory(''); }}
            />
          </div>

          {/* Mobile Search button */}
          <button className="lg:hidden text-white/60 p-2" onClick={() => document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' })}>
            <Search size={24} />
          </button>

          {/* Cart button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-white text-brand-navy text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-brand-navy">
                {cart.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Category nav bar ── */}
        <div className="bg-brand-blue/50 backdrop-blur-md border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={clearFilters}
                className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors flex-shrink-0 ${
                  !selectedCategory ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white'
                }`}
              >
                🏠 All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.name}
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors flex-shrink-0 ${
                    selectedCategory === cat.name ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white'
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
      <div className="max-w-7xl mx-auto w-full px-6 py-12 flex flex-col gap-12">

        {/* Flash deals */}
        {offerProducts.length > 0 && <FlashDeals products={offerProducts} />}

        {/* ── Shop by Department grid ── */}
        {!selectedCategory && !searchTerm && (
          <section>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Shop by Department</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {CATEGORIES.map(cat => (
                <div 
                  key={cat.name} 
                  onClick={() => handleCategorySelect(cat.name)}
                  className="group cursor-pointer bg-white rounded-2xl p-6 transition-all overflow-hidden relative border border-zinc-100 hover:border-brand-navy shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                  <h3 className="font-bold text-lg group-hover:text-brand-navy transition-colors">{cat.name}</h3>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest mt-1">Explore Range</p>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-brand-navy/5 rounded-full group-hover:scale-150 transition-all"></div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Products section ── */}
        <div id="products-grid" className="scroll-mt-32">

          {/* Section header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
              <span className="w-2 h-8 bg-brand-navy rounded-full inline-block"></span>
              {searchTerm
                ? `Results for "${searchTerm}"`
                : selectedCategory
                ? selectedCategory
                : 'All Products'}
              <span className="text-zinc-400 font-bold text-sm tracking-widest">[{filteredProducts.length}]</span>
            </h2>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-zinc-200">
                <SlidersHorizontal size={14} className="text-zinc-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-xs font-bold uppercase tracking-widest outline-none bg-transparent cursor-pointer"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              {/* Clear */}
              {(selectedCategory || searchTerm || sortBy !== 'default') && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 text-xs text-red-500 font-bold uppercase tracking-widest border border-red-100 bg-red-50 px-4 py-2 rounded-full hover:bg-red-100 transition-colors"
                >
                  <X size={14} /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Subcategory pills */}
          {selectedCategory && subcategories.length > 0 && (
            <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide pb-2">
              <button
                onClick={() => setSelectedSubcategory('')}
                className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all flex-shrink-0 ${
                  !selectedSubcategory ? 'bg-brand-navy text-white border-brand-navy shadow-lg shadow-brand-navy/20' : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand-navy'
                }`}
              >
                All {selectedCategory}
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub.name}
                  onClick={() => setSelectedSubcategory(sub.name)}
                  className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all flex-shrink-0 ${
                    selectedSubcategory === sub.name ? 'bg-brand-navy text-white border-brand-navy shadow-lg shadow-brand-navy/20' : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand-navy'
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
              <div className="w-12 h-12 border-4 border-brand-navy border-t-zinc-200 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-500 font-medium italic">Loading Dynasty Mall...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-dashed border-zinc-200">
              <span className="text-6xl mb-6">🔍</span>
              <p className="text-xl font-bold text-zinc-900 mb-2">No products found</p>
              <p className="text-zinc-500 mb-6">Try adjusting your filters or search terms</p>
              <button onClick={clearFilters} className="bg-brand-navy text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform">
                Browse All Products
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="bg-brand-navy text-white mt-20 py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          <div>
            <Logo className="h-8 w-auto mb-8" />
            <p className="text-white/40 text-sm leading-relaxed max-w-sm">
              Dynasty Bridge is Mumias' leading electronics hub. We deal in quality appliances, electronics, and home essentials with guaranteed durability and the best prices in town.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold uppercase text-xs tracking-[0.3em] text-white/30">Contact Us</h4>
            <div className="flex items-center gap-4 text-sm text-white/80 hover:text-white transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><Phone size={18} /></div>
              0740930686
            </div>
            <div className="flex items-center gap-4 text-sm text-white/80 hover:text-white transition-colors cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center"><MapPin size={18} /></div>
              Opposite Frankmatt Junction, Mumias
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="font-bold uppercase text-xs tracking-[0.3em] text-white/30">Top Departments</h4>
            <div className="grid grid-cols-2 gap-y-3 gap-x-8">
              {CATEGORIES.slice(0, 8).map(cat => (
                <button
                  key={cat.name}
                  onClick={() => { handleCategorySelect(cat.name); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="text-xs text-white/50 hover:text-white text-left transition-colors font-bold uppercase tracking-widest"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-16 pt-10 text-center text-[10px] text-white/20 uppercase tracking-[0.4em] font-bold">
          © 2026 Dynasty Bridge. All rights reserved. Built for Mumias Kakamega.
        </div>
      </footer>

      <WhatsAppBubble />
      <ChatPanel />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default App;
