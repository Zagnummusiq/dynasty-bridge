import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Phone, MapPin, RefreshCw } from 'lucide-react';
import Logo from './components/Logo';
import ShopStatus from './components/ShopStatus';
import ProductCard from './components/ProductCard';
import WhatsAppBubble from './components/WhatsAppBubble';
import ChatPanel from './components/ChatPanel';
import CartDrawer from './components/CartDrawer';
import PromoFlyer from './components/PromoFlyer';
import CategoryBrowser from './components/CategoryBrowser';
import type { Product } from './context/CartContext';
import { useCart } from './context/CartContext';
import { getCachedProducts, syncProductsToCache } from './utils/db';
import { SHOP_PRODUCTS } from './data/shopProducts';
import { CATEGORIES, matchSubcategory } from './data/categories';

const App: React.FC = () => {
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { cart } = useCart();

  // Vite proxies /api → backend:8000 in dev; set VITE_API_URL for production deploys
  const API_URL = import.meta.env.VITE_API_URL || '';

  // ── Online/offline detection ─────────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // ── Load API products (cache-first then network) ─────────────────────────
  useEffect(() => {
    const initData = async () => {
      // 1. Load from IndexedDB cache immediately
      try {
        const cached = await getCachedProducts();
        // Only keep API products (id < 10000) from cache
        const cachedApi = cached.filter(p => p.id < 10000);
        if (cachedApi.length > 0) {
          setApiProducts(cachedApi);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Cache read error:', err);
      }

      // 2. Fetch fresh data from API
      try {
        const res = await axios.get(`${API_URL}/api/products`, { timeout: 10000 });
        const fresh: Product[] = res.data.map((p: Product) => {
          // Try to assign subcategory from categories data
          const match = matchSubcategory(p.name, p.category);
          return {
            ...p,
            source: 'api' as const,
            category: match?.category ?? p.category,
            subcategory: match?.subcategory,
          };
        });
        setApiProducts(fresh);
        await syncProductsToCache(fresh);
      } catch (err) {
        console.warn('API unavailable, using cached/shop data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // ── Merge shop + API products ─────────────────────────────────────────────
  const allProducts = useMemo<Product[]>(() => {
    const shopAsProducts: Product[] = SHOP_PRODUCTS.map(p => ({ ...p }));
    // Deduplicate: prefer shop products, append API products not in shop
    const shopIds = new Set(shopAsProducts.map(p => p.id));
    const uniqueApi = apiProducts.filter(p => !shopIds.has(p.id));
    return [...shopAsProducts, ...uniqueApi];
  }, [apiProducts]);

  // ── Build product counts per category/subcategory ────────────────────────
  const productCounts = useMemo<Record<string, Record<string, number>>>(() => {
    const counts: Record<string, Record<string, number>> = {};
    for (const p of allProducts) {
      if (!p.category) continue;
      if (!counts[p.category]) counts[p.category] = {};
      if (p.subcategory) {
        counts[p.category][p.subcategory] = (counts[p.category][p.subcategory] || 0) + 1;
      } else {
        counts[p.category]['_uncategorized'] = (counts[p.category]['_uncategorized'] || 0) + 1;
      }
    }
    return counts;
  }, [allProducts]);

  // ── Filter products ───────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term)
      );
    }
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }
    if (selectedSubcategory) {
      list = list.filter(p => p.subcategory === selectedSubcategory);
    }
    return list;
  }, [allProducts, searchTerm, selectedCategory, selectedSubcategory]);

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  // ── Category quick-tabs (above product grid) ──────────────────────────────
  const categoryTabs = useMemo(() => {
    const known = CATEGORIES.map(c => c.name);
    const extra = [...new Set(allProducts.map(p => p.category))].filter(c => !known.includes(c));
    return ['All', ...known.filter(c => allProducts.some(p => p.category === c)), ...extra];
  }, [allProducts]);

  const activeFilterLabel = selectedSubcategory
    ? `${selectedCategory} → ${selectedSubcategory}`
    : selectedCategory || 'All Products';

  return (
    <div className="min-h-screen flex flex-col">

      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-400 text-black text-[11px] font-bold text-center py-2 px-4 uppercase tracking-widest flex items-center justify-center gap-2">
          <RefreshCw size={12} className="animate-spin" />
          You're offline — browsing cached products
        </div>
      )}

      {/* Top Header */}
      <header className="bg-black text-white py-2 px-6 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold">
        <div className="flex items-center gap-4">
          <ShopStatus />
          <span className="hidden md:inline">📍 Mumias, opposite Frankmatt Junction</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:0740930686" className="flex items-center gap-1 hover:text-mustard">
            <Phone size={10} /> Hotline: 0740930686
          </a>
        </div>
      </header>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Logo className="h-10 w-auto" />
          <div className="hidden lg:flex items-center bg-zinc-100 rounded-full px-4 py-2 w-96">
            <Search size={18} className="text-zinc-400" />
            <input
              type="text"
              placeholder="Search TVs, fridges, speakers, solar..."
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value) {
                  setSelectedCategory('');
                  setSelectedSubcategory('');
                }
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-zinc-100 rounded-full transition-colors"
          >
            <ShoppingCart size={24} />
            {cart.length > 0 && (
              <span className="absolute top-0 right-0 bg-mustard text-black text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-white">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="lg:hidden px-4 py-3 bg-white border-b border-zinc-100">
        <div className="flex items-center bg-zinc-100 rounded-full px-4 py-2">
          <Search size={16} className="text-zinc-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full outline-none"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) {
                setSelectedCategory('');
                setSelectedSubcategory('');
              }
            }}
          />
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-mustard py-16 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border-8 border-black rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 border-8 border-black rounded-full rotate-45"></div>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-black mb-4 uppercase italic leading-none z-10">
          Dynasty <span className="text-zinc-800">Bridge</span>
        </h1>
        <p className="text-black font-bold max-w-2xl text-base md:text-xl opacity-90 z-10 mb-8">
          MUMIAS' ULTIMATE ELECTRONICS & HOME HUB
        </p>
        <div className="flex gap-4 z-10 flex-wrap justify-center">
          <button
            onClick={() => {
              setSelectedCategory('Televisions');
              setSelectedSubcategory('');
              document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-black text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform"
          >
            Shop TVs
          </button>
          <button
            onClick={() => {
              setSelectedCategory('Refrigerators');
              setSelectedSubcategory('');
              document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform border-2 border-black"
          >
            Home Appliances
          </button>
        </div>
      </section>

      <PromoFlyer products={allProducts} />

      {/* Category Browser */}
      <CategoryBrowser
        selectedCategory={selectedCategory}
        selectedSubcategory={selectedSubcategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubcategory('');
          setSearchTerm('');
        }}
        onSelectSubcategory={(sub) => {
          setSelectedSubcategory(sub);
          setSearchTerm('');
        }}
        onClearFilters={handleClearFilters}
        productCounts={productCounts}
      />

      {/* Main Products Grid */}
      <main id="products-grid" className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Quick-filter tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map(cat => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === 'All') {
                    handleClearFilters();
                    setSearchTerm('');
                  } else {
                    setSelectedCategory(cat);
                    setSelectedSubcategory('');
                    setSearchTerm('');
                  }
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  (cat === 'All' && !selectedCategory && !selectedSubcategory && !searchTerm) ||
                  (cat !== 'All' && selectedCategory === cat && !selectedSubcategory)
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest whitespace-nowrap">
            {searchTerm
              ? `"${searchTerm}" — ${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''}`
              : `${activeFilterLabel} · ${filteredProducts.length} item${filteredProducts.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Loading state */}
        {isLoading && allProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-mustard border-t-black rounded-full animate-spin"></div>
            <p className="mt-4 text-zinc-500 font-medium">Loading Dynasty Mall...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-zinc-500 font-medium">No products found.</p>
            <button
              onClick={() => { handleClearFilters(); setSearchTerm(''); }}
              className="mt-4 text-xs font-bold underline text-zinc-400 hover:text-black"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <Logo className="h-8 w-auto mb-6 bg-transparent" />
            <p className="text-zinc-500 text-sm leading-relaxed">
              Dynasty Bridge is Mumias' leading electronics hub. We deal in quality appliances, electronics, and home essentials with guaranteed durability and the best prices in town.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-xs text-zinc-400">Contact Us</h4>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <Phone size={16} /> 0740930686
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <MapPin size={16} /> Opposite Frankmatt Junction, Mumias Town
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold uppercase tracking-widest text-xs text-zinc-400">Shop Location</h4>
            <div className="w-full h-40 bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center text-xs text-zinc-600 italic">
              Map view — Mumias Town
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-zinc-800 mt-12 pt-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
          &copy; 2026 Dynasty Bridge. All rights reserved. Built for Mumias, Kakamega.
        </div>
      </footer>

      <WhatsAppBubble />
      <ChatPanel />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default App;
