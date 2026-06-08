'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore, CartProduct } from '../store/cartStore';
import { ShoppingCart, Heart, Tag } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    images: string[];
    stock: number;
    category?: { name: string } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const currentPrice = product.salePrice || product.price;
  const hasSale = !!product.salePrice;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    
    const cartProduct: CartProduct = {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      stock: product.stock,
    };
    addItem(cartProduct, 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-orange-50 flex flex-col h-full premium-card">
      {/* Product Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        {hasSale && (
          <div className="absolute top-3 left-3 bg-[#E07A5F] text-white text-xs font-bold px-2.5 py-1 rounded-full z-10 flex items-center gap-1 shadow-sm">
            <Tag className="w-3.5 h-3.5" />
            <span>SALE</span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-15 backdrop-blur-[1px]">
            <span className="text-white text-sm font-bold tracking-wider bg-black/60 px-4 py-2 rounded-full">
              OUT OF STOCK
            </span>
          </div>
        )}
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'}
            alt={product.title}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </Link>
        
        {/* Wishlist Button Overlay */}
        <button className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-[#3D405B] hover:text-[#E07A5F] rounded-full shadow-sm transition-all z-10">
          <Heart className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-grow">
        {product.category && (
          <span className="text-xs text-[#81B29A] font-semibold tracking-wider uppercase mb-1">
            {product.category.name}
          </span>
        )}
        
        <Link href={`/products/${product.slug}`} className="hover:text-[#E07A5F] transition-colors flex-grow">
          <h3 className="font-bold text-lg text-[#3D405B] line-clamp-1 mb-2 leading-tight">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-orange-50/50">
          {/* Price block */}
          <div className="flex items-baseline space-x-2">
            <span className="text-xl font-bold text-[#E07A5F]">Rs. {currentPrice}</span>
            {hasSale && (
              <span className="text-sm text-gray-400 line-through">Rs. {product.price}</span>
            )}
          </div>

          {/* Quick Add Cart Icon */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-full shadow-sm transition-all duration-300 ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-50 text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
