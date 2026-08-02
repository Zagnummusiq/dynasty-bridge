import React, { useState, useEffect, useRef } from 'react';
import { Zap, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import type { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';

interface Props {
  products: Product[];
}

function useCountdown(hours: number) {
  const endRef = useRef<number>(Date.now() + hours * 60 * 60 * 1000);
  const [remaining, setRemaining] = useState(endRef.current - Date.now());

  useEffect(() => {
    const t = setInterval(() => {
      const left = endRef.current - Date.now();
      if (left <= 0) {
        endRef.current = Date.now() + hours * 60 * 60 * 1000;
      }
      setRemaining(Math.max(0, endRef.current - Date.now()));
    }, 1000);
    return () => clearInterval(t);
  }, [hours]);

  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1_000);
  return { h, m, s };
}

const FlashDeals: React.FC<Props> = ({ products }) => {
  const { addToCart } = useCart();
  const { h, m, s } = useCountdown(6);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'right' ? 240 : -240, behavior: 'smooth' });
    }
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const offerProducts = products
    .filter(p => p.is_on_offer && p.discount_percentage && p.discount_percentage > 0)
    .slice(0, 20);

  if (offerProducts.length === 0) return null;

  return (
    <section className="bg-white shadow-sm rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-white fill-white" />
          <span className="text-white font-black text-base uppercase tracking-wide">Flash Deals</span>
          {/* Countdown */}
          <div className="flex items-center gap-1 ml-2">
            {[pad(h), pad(m), pad(s)].map((unit, i) => (
              <React.Fragment key={i}>
                <span className="bg-white text-brand-navy font-black text-sm px-2 py-0.5 rounded-sm min-w-[32px] text-center">
                  {unit}
                </span>
                {i < 2 && <span className="text-white font-black text-sm">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => scroll('left')} className="bg-zinc-700 text-white rounded p-1 hover:bg-zinc-600">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} className="bg-zinc-700 text-white rounded p-1 hover:bg-zinc-600">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Product row */}
      <div
        ref={scrollRef}
        className="flex gap-px overflow-x-auto scrollbar-hide bg-zinc-100"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {offerProducts.map(p => {
          const salePrice = p.discount_percentage
            ? Math.round(p.price * (1 - p.discount_percentage / 100))
            : p.price;

          return (
            <div
              key={p.id}
              className="flex-shrink-0 bg-white flex flex-col"
              style={{ width: '160px', scrollSnapAlign: 'start' }}
            >
              {/* Image */}
              <div className="relative" style={{ height: '140px' }}>
                <img
                  src={p.image_url}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-contain p-2"
                  onError={e => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/300x300/f5f5f5/999?text=${encodeURIComponent(p.category)}`;
                  }}
                />
                {p.discount_percentage && (
                  <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                    -{p.discount_percentage}%
                  </span>
                )}
              </div>
              {/* Details */}
              <div className="px-2 pb-2 flex flex-col flex-grow">
                <p className="text-xs text-zinc-700 line-clamp-2 mb-1 leading-tight flex-grow">{p.name}</p>
                <p className="text-sm font-black text-red-600">KES {salePrice.toLocaleString()}</p>
                <p className="text-[10px] text-zinc-400 line-through">KES {Number(p.price).toLocaleString()}</p>
                <button
                  onClick={() => addToCart(p)}
                  className="mt-1.5 w-full bg-brand-navy text-white text-[10px] font-bold py-1 rounded-sm hover:bg-brand-blue flex items-center justify-center gap-1"
                >
                  <ShoppingCart size={10} /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FlashDeals;
