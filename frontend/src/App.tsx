import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Search, Phone, MapPin } from 'lucide-react';
import Logo from './components/Logo';
import ShopStatus from './components/ShopStatus';
import ProductCard from './components/ProductCard';
import WhatsAppBubble from './components/WhatsAppBubble';
import ChatPanel from './components/ChatPanel';
import CartDrawer from './components/CartDrawer';
import PromoFlyer from './components/PromoFlyer';
import type { Product } from './context/CartContext';
import { useCart } from './context/CartContext';
import { getCachedProducts, syncProductsToCache } from './utils/db';

const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { cart } = useCart();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000';

  useEffect(() => {
    const initData = async () => {
      // 1. Load from cache immediately for offline support
      try {
        const cached = await getCachedProducts();
        if (cached.length > 0) {
          setProducts(cached);
          setFilteredProducts(cached);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Cache read error:', err);
      }

      // 2. Fetch fresh data from API and update cache
      try {
        const res = await axios.get(`${API_URL}/api/products`);
        const freshProducts = res.data;
        setProducts(freshProducts);
        setFilteredProducts(freshProducts);
        await syncProductsToCache(freshProducts);
      } catch (err) {
        console.warn('API fetch failed, working in offline mode:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    // Smooth scroll to the products grid
    const grid = document.getElementById('products-grid');
    if (grid) {
      const navHeight = 80; // approximate height of sticky nav
      const elementPosition = grid.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - navHeight,
        behavior: 'smooth'
      });
    }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      {/* Top Header */}
      <header className="bg-brand-navy text-white/60 py-2 px-6 flex justify-between items-center text-[10px] uppercase tracking-widest font-bold border-b border-white/5">
        <div className="flex items-center gap-4">
          <ShopStatus />
          <span className="hidden md:inline">📍 Mumias, opposite Frankmatt Junction</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:0740930686" className="flex items-center gap-1 hover:text-white transition-colors">
            <Phone size={10} /> Hotline: 0740930686
          </a>
        </div>
      </header>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-50 bg-brand-navy border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Logo className="h-10 w-auto" />
          <div className="hidden lg:flex items-center bg-white/10 rounded-full px-4 py-2 w-96 border border-white/5 focus-within:border-white/20 transition-colors">
            <Search size={18} className="text-white/40" />
            <input
              type="text"
              placeholder="Search smart TVs, subwoofers, fridges..."
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-white placeholder:text-white/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
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
      </nav>

      {/* Hero Section */}
      <section className="bg-brand-navy py-16 px-6 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-40 h-40 border-8 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 border-8 border-white rounded-full rotate-45"></div>
        </div>
        <h1 className="text-5xl md:text-8xl font-black text-white mb-4 uppercase italic leading-none z-10">
          Dynasty <span className="text-white/40">Bridge</span>
        </h1>
        <p className="text-white/80 font-bold max-w-2xl text-base md:text-xl z-10 mb-8 uppercase tracking-[0.2em]">
          MUMIAS' ULTIMATE ELECTRONICS & HOME HUB
        </p>
        <div className="flex gap-4 z-10">
          <button className="bg-white text-brand-navy px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-lg shadow-white/5">
            Shop Smart TVs
          </button>
          <button className="bg-transparent text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors border-2 border-white/20">
            Home Appliances
          </button>
        </div>
      </section>

      <PromoFlyer products={products} />

      {/* Dynamic Shop by Category */}
      <section className="max-w-7xl mx-auto w-full px-6 py-12">
        <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Shop by Department</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.filter(c => c !== 'All').map((cat) => (
            <div 
              key={cat} 
              onClick={() => handleCategoryClick(cat)}
              className={`group cursor-pointer rounded-2xl p-6 transition-all overflow-hidden relative border shadow-sm hover:shadow-xl ${
                selectedCategory === cat 
                  ? 'bg-brand-navy border-brand-navy' 
                  : 'bg-white border-zinc-100 hover:border-brand-navy'
              }`}
            >
              <h3 className={`font-bold text-lg transition-colors ${
                selectedCategory === cat ? 'text-white' : 'group-hover:text-white'
              }`}>{cat}</h3>
              <p className={`text-xs uppercase font-bold tracking-widest mt-1 transition-colors ${
                selectedCategory === cat ? 'text-white/60' : 'text-zinc-500 group-hover:text-white/60'
              }`}>Explore Range</p>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-brand-navy/5 rounded-full group-hover:scale-150 group-hover:bg-white/5 transition-all"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main id="products-grid" className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        {isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-navy border-t-zinc-200 rounded-full animate-spin"></div>
            <p className="mt-4 text-zinc-500 font-medium italic">Loading Dynasty Mall...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                  selectedCategory === cat
                    ? 'bg-brand-navy text-white border-brand-navy'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:border-brand-navy'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest">
            Showing {filteredProducts.length} items
          </p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400">
            No products found matching your criteria.
          </div>
        )}
          </>
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
            <div className="w-full h-40 bg-zinc-800 rounded-xl overflow-hidden grayscale contrast-125 opacity-50">
               {/* Map placeholder */}
               <div className="w-full h-full flex items-center justify-center text-xs text-zinc-600 italic">
                 Map view for Mumias Town
               </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-zinc-800 mt-12 pt-8 text-center text-[10px] text-zinc-600 uppercase tracking-widest">
          &copy; 2026 Dynasty Bridge. All rights reserved. Built for Mumias Kakamega.
        </div>
      </footer>

      <WhatsAppBubble />
      <ChatPanel />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default App;
