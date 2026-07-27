import React from 'react';
import type { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Tag } from 'lucide-react';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  const discountedPrice =
    product.is_on_offer && product.discount_percentage
      ? product.price * (1 - product.discount_percentage / 100)
      : null;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-4 flex flex-col border border-zinc-100 group">
      {/* Image */}
      <div className="aspect-square bg-zinc-100 rounded-lg mb-3 overflow-hidden relative">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = `https://placehold.co/400x400/f4f4f5/71717a?text=${encodeURIComponent(product.category || 'Product')}`;
          }}
        />
        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-black/80 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold backdrop-blur-sm">
          {product.category}
        </span>
        {/* Offer badge */}
        {product.is_on_offer && product.discount_percentage && (
          <span className="absolute top-2 right-2 bg-mustard text-black text-[9px] px-2 py-0.5 rounded-full font-black">
            -{product.discount_percentage}%
          </span>
        )}
        {/* Shop badge */}
        {product.source === 'shop' && (
          <span className="absolute bottom-2 right-2 bg-white/90 text-zinc-600 text-[8px] px-1.5 py-0.5 rounded-full font-bold border border-zinc-200 flex items-center gap-0.5">
            <Tag size={8} /> In Store
          </span>
        )}
      </div>

      {/* Name */}
      <h3 className="font-semibold text-zinc-900 text-sm leading-tight line-clamp-2 mb-1">
        {product.name}
      </h3>

      {/* Subcategory */}
      {product.subcategory && (
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-1">
          {product.subcategory}
        </p>
      )}

      {/* Description */}
      <p className="text-zinc-500 text-xs line-clamp-2 mb-3 flex-grow">
        {product.description}
      </p>

      {/* Price + Cart */}
      <div className="flex items-end justify-between mt-auto gap-2">
        <div className="flex flex-col">
          {discountedPrice ? (
            <>
              <span className="text-base font-black text-zinc-900">
                KES {Math.round(discountedPrice).toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-400 line-through">
                KES {Number(product.price).toLocaleString()}
              </span>
            </>
          ) : (
            <span className="text-base font-black text-zinc-900">
              KES {Number(product.price).toLocaleString()}
            </span>
          )}
        </div>
        <button
          onClick={() => addToCart(product)}
          className="bg-black text-white p-2 rounded-lg hover:bg-zinc-700 active:scale-95 transition-all flex-shrink-0"
          title="Add to Cart"
        >
          <ShoppingCart size={18} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
