import React from 'react';
import type { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Star } from 'lucide-react';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  const salePrice =
    product.is_on_offer && product.discount_percentage
      ? Math.round(product.price * (1 - product.discount_percentage / 100))
      : null;

  return (
    <div className="bg-white flex flex-col hover:shadow-md transition-shadow duration-200 group cursor-pointer">
      {/* Image area */}
      <div className="relative overflow-hidden bg-zinc-50" style={{ paddingBottom: '100%', position: 'relative' }}>
        <div className="absolute inset-0 p-3 flex items-center justify-center">
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              const img = e.target as HTMLImageElement;
              img.src = `https://placehold.co/400x400/f5f5f5/aaaaaa?text=${encodeURIComponent(product.category || 'Product')}`;
            }}
          />
        </div>

        {/* Discount badge */}
        {product.discount_percentage && product.discount_percentage > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-sm">
            -{product.discount_percentage}%
          </span>
        )}

        {/* In-store badge */}
        {product.source === 'shop' && (
          <span className="absolute top-2 right-2 bg-brand-navy text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
            In Store
          </span>
        )}
      </div>

      {/* Details */}
      <div className="px-3 py-2 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="text-xs text-zinc-800 line-clamp-2 leading-snug mb-2 flex-grow min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base font-black text-red-600">
              KES {(salePrice ?? Number(product.price)).toLocaleString()}
            </span>
            {salePrice && (
              <span className="text-[11px] text-zinc-400 line-through">
                KES {Number(product.price).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Rating placeholder */}
        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              size={10}
              className={i <= 4 ? 'fill-brand-navy text-brand-navy' : 'fill-zinc-200 text-zinc-200'}
            />
          ))}
          <span className="text-[9px] text-zinc-400 ml-0.5">(4.0)</span>
        </div>

        {/* Subcategory label */}
        {product.subcategory && (
          <p className="text-[9px] text-zinc-400 uppercase tracking-wider mb-2">{product.subcategory}</p>
        )}

        {/* Add to cart */}
        <button
          onClick={e => { e.stopPropagation(); addToCart(product); }}
          className="w-full bg-brand-navy text-white text-xs font-bold py-2 rounded-sm hover:bg-brand-blue active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-auto"
        >
          <ShoppingCart size={13} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
