import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Sparkles, Clock } from 'lucide-react';
import type { Product } from '../context/CartContext';

interface PromoFlyerProps {
  products: Product[];
}

const PromoFlyer: React.FC<PromoFlyerProps> = ({ products }) => {
  const [currentIndex, setCurrentTime] = useState(0);
  const offerProducts = products.filter(p => p.is_on_offer);

  useEffect(() => {
    if (offerProducts.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => (prev + 1) % offerProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [offerProducts.length]);

  if (offerProducts.length === 0) return null;

  const current = offerProducts[currentIndex];

  return (
    <section className="max-w-7xl mx-auto w-full px-6 py-12">
      <div className="bg-brand-navy rounded-3xl overflow-hidden relative min-h-[400px] flex flex-col md:flex-row shadow-2xl border border-white/10">
        {/* Visual Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-20 pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Content Side */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center z-10">
          <motion.div
            key={`text-${current.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white text-brand-navy px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                <Tag size={12} /> Seasonal Offer
              </span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <Clock size={12} /> Limited Time Only
              </span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic leading-tight">
              {current.discount_percentage}% <span className="text-white/40">OFF</span> <br />
              <span className="text-2xl md:text-4xl normal-case not-italic font-bold">{current.name}</span>
            </h2>
            
            <p className="text-white/60 text-sm md:text-base max-w-md">
              {current.description}. Grab this unbeatable deal today at Dynasty Bridge, Mumias!
            </p>

            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-white/40 line-through text-sm">KES {Number(current.price / (1 - (current.discount_percentage || 0) / 100)).toLocaleString()}</span>
                <span className="text-white text-3xl font-black">KES {Number(current.price).toLocaleString()}</span>
              </div>
              <button className="bg-white text-brand-navy px-8 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-2">
                Get Offer Now <Sparkles size={16} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Image Side */}
        <div className="flex-1 relative min-h-[300px] md:min-h-full overflow-hidden bg-white/5">
          <AnimatePresence mode="wait">
            <motion.img
              key={`img-${current.id}`}
              src={current.image_url}
              alt={current.name}
              initial={{ opacity: 0, scale: 1.1, rotate: 5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: -5 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full object-contain p-12 drop-shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800?text=Premium+Appliance';
              }}
            />
          </AnimatePresence>
          
          {/* Offer Badge Overlay */}
          <div className="absolute top-8 right-8 bg-white text-brand-navy w-20 h-20 rounded-full flex flex-col items-center justify-center rotate-12 shadow-xl border-4 border-brand-navy">
            <span className="text-xs font-black leading-none">SAVE</span>
            <span className="text-xl font-black leading-none">{current.discount_percentage}%</span>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {offerProducts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentTime(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentIndex === i ? 'bg-white w-8' : 'bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoFlyer;
