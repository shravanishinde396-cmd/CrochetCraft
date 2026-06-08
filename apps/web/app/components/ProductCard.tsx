'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore, CartProduct } from '../store/cartStore';
import { ShoppingCart, Heart } from 'lucide-react';

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
    bestSeller?: boolean;
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
    <div className={`bg-surface-container-lowest rounded-[20px] overflow-hidden shadow-[0_4px_16px_rgba(224,64,160,0.08)] hover:shadow-[0_12px_32px_rgba(224,64,160,0.15)] transition-all duration-300 hover:scale-[1.03] flex flex-col group border border-surface-container-highest ${isOutOfStock ? 'opacity-75 grayscale-[0.2]' : ''}`}>
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-surface-container">
        {hasSale && (
          <div className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
            Sale
          </div>
        )}
        {product.bestSeller && (
          <div className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">
            Bestseller
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-surface text-on-surface font-black px-4 py-2 rounded-full shadow-lg uppercase tracking-widest text-xs">
              Out of Stock
            </span>
          </div>
        )}
        <Link href={`/products/${product.slug}`}>
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/300?text=No+Image'}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </Link>
        <button className="absolute top-3 right-3 bg-white/90 backdrop-blur text-outline hover:text-primary p-2 rounded-full shadow-sm hover:shadow-md transition-all active:scale-90 z-10">
          <Heart className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          {product.category && (
            <p className="text-xs font-bold text-tertiary uppercase tracking-wider mb-1">
              {product.category.name}
            </p>
          )}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-lg text-on-background leading-tight hover:text-primary transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex flex-col">
            <span className="font-black text-2xl text-primary">₹{currentPrice}</span>
            {hasSale && (
              <span className="text-xs text-outline line-through">₹{product.price}</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all ${
            isOutOfStock
              ? 'bg-surface-variant text-outline cursor-not-allowed'
              : 'bg-primary hover:bg-[#c9328c] text-white shadow-[0_4px_16px_rgba(224,64,160,0.2)] active:scale-95'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
