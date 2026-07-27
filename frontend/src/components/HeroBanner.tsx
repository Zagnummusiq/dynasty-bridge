import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  headline: string;
  sub: string;
  cta: string;
  category: string;
  bg: string;
  icon: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    headline: 'Smart TVs — Best Prices',
    sub: 'Samsung, TCL, Vitron & more. 4K UHD from KES 16,500',
    cta: 'Shop TVs',
    category: 'Televisions',
    bg: 'from-zinc-900 via-zinc-800 to-zinc-700',
    icon: '📺',
  },
  {
    id: 2,
    headline: 'Home Appliances Sale',
    sub: 'Fridges, cookers, washing machines & more. Up to 15% off.',
    cta: 'Shop Appliances',
    category: 'Refrigerators',
    bg: 'from-sky-900 via-sky-800 to-sky-700',
    icon: '🧊',
  },
  {
    id: 3,
    headline: 'Solar & Power Systems',
    sub: 'Keep the lights on. Solar panels, inverters & batteries.',
    cta: 'Shop Solar',
    category: 'Power & Solar',
    bg: 'from-amber-700 via-amber-600 to-yellow-500',
    icon: '🔋',
  },
  {
    id: 4,
    headline: 'Audio That Hits Different',
    sub: 'Home theatre, woofers, Bluetooth speakers & car audio.',
    cta: 'Shop Audio',
    category: 'Audio & Sound',
    bg: 'from-purple-900 via-purple-800 to-purple-700',
    icon: '🎵',
  },
];

interface Props {
  onShopCategory: (cat: string) => void;
}

const HeroBanner: React.FC<Props> = ({ onShopCategory }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent(c => (c + 1) % SLIDES.length);

  const slide = SLIDES[current];

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '280px' }}>
      {/* Slide */}
      <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg} flex items-center transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-8 w-full flex items-center justify-between">
          {/* Text side */}
          <div className="max-w-xl">
            <p className="text-mustard text-xs font-bold uppercase tracking-widest mb-2">Dynasty Bridge — Mumias</p>
            <h2 className="text-white text-3xl md:text-5xl font-black leading-tight mb-3">
              {slide.headline}
            </h2>
            <p className="text-white/80 text-sm md:text-base mb-6">{slide.sub}</p>
            <button
              onClick={() => {
                onShopCategory(slide.category);
                document.getElementById('products-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-mustard text-black font-bold px-8 py-3 rounded-sm hover:opacity-90 transition-opacity text-sm uppercase tracking-wide"
            >
              {slide.cta} →
            </button>
          </div>
          {/* Icon side */}
          <div className="hidden md:flex text-[120px] opacity-30 select-none">
            {slide.icon}
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors z-10"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors z-10"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${i === current ? 'bg-mustard w-6 h-2' : 'bg-white/50 w-2 h-2'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
