import React from 'react';
import type { Product } from '../context/CartContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 flex flex-col border border-zinc-100">
      <div className="aspect-square bg-zinc-100 rounded-lg mb-4 overflow-hidden relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="object-cover w-full h-full hover:scale-105 transition-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500?text=Product+Image';
          }}
        />
        <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
          {product.category}
        </span>
      </div>
      <h3 className="font-semibold text-zinc-900 truncate mb-1">{product.name}</h3>
      <p className="text-zinc-500 text-xs line-clamp-2 mb-3 flex-grow">{product.description}</p>
      <div className="flex items-center justify-between mt-auto">
        <span className="text-lg font-bold text-zinc-900">
          KES {Number(product.price).toLocaleString()}
        </span>
        <button
          onClick={() => addToCart(product)}
          className="bg-black text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors"
          title="Add to Cart"
        >
          <ShoppingCart size={20} />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
