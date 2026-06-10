'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { API_BASE } from '../utils/apiFetch';

export default function CartPage() {
  const { 
    items, 
    subtotal, 
    discount, 
    shipping, 
    tax, 
    total, 
    coupon, 
    updateQuantity, 
    removeItem, 
    applyCoupon, 
    removeCoupon, 
    clearCart 
  } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponStatus(null);
    try {
      const response = await fetch(`${API_BASE}/api/v1/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        applyCoupon({
          code: data.data.code,
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
        });
        setCouponStatus({ type: 'success', message: 'Coupon applied successfully!' });
      } else {
        setCouponStatus({ type: 'error', message: data.message || 'Invalid coupon code.' });
      }
    } catch {
      setCouponStatus({ type: 'error', message: 'Coupon service offline.' });
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      alert('Please login to complete your checkout.');
      return;
    }
    alert('Checkout successfully initiated! In a production environment, this will trigger the Razorpay payment gate window.');
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6">
        <div className="w-48 h-48 bg-surface-container-high rounded-full flex items-center justify-center mb-8 shadow-sm">
          <ShoppingBag className="w-24 h-24 text-outline-variant" />
        </div>
        <h2 className="text-3xl font-black text-on-surface mb-4 font-headline">Your cart is feeling light!</h2>
        <p className="text-on-surface-variant text-lg mb-8 max-w-md">
          Looks like you have not added any joyful handmade items to your cart yet.
        </p>
        <Link 
          href="/products" 
          className="bg-secondary hover:opacity-90 text-on-secondary font-bold text-lg py-4 px-8 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen pt-8 pb-12">
      <main className="max-w-7xl mx-auto w-full px-6">
        
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-black text-on-surface mb-2 font-headline tracking-tight">
            Your Candy Cart
          </h1>
          <p className="text-on-surface-variant text-lg">Joyful handmade items waiting for you.</p>
        </div>

        {/* Cart Layout: Grid for items and summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => {
              const itemPrice = item.product.salePrice || item.product.price;
              return (
                <div 
                  key={item.product.id} 
                  className="bg-white/70 backdrop-blur rounded-[2rem] p-6 flex flex-col sm:flex-row items-center gap-6 border border-white/50 shadow-[0_8px_32px_rgba(224,64,160,0.08)] hover:scale-[1.01] transition-transform duration-300 group"
                >
                  <div className="w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-md relative">
                    <Image 
                      alt={item.product.title} 
                      className="object-cover transform group-hover:scale-110 transition-transform duration-500" 
                      src={item.product.images?.[0] || 'https://via.placeholder.com/150'} 
                      fill
                      sizes="128px"
                    />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between h-full w-full">
                    <div className="flex justify-between items-start w-full mb-4 sm:mb-0">
                      <div>
                        <h3 className="text-xl font-bold text-on-surface mb-1">{item.product.title}</h3>
                        <span className="inline-block bg-primary-fixed text-on-primary-fixed text-xs font-bold px-3 py-1 rounded-full mb-2">
                          Premium Yarn
                        </span>
                      </div>
                      <button 
                        onClick={() => removeItem(item.product.id)}
                        className="text-outline hover:text-error transition-colors p-2 rounded-full hover:bg-error-container"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end w-full">
                      {/* Quantity Controls */}
                      <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant shadow-sm">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-on-surface">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-2xl font-black text-secondary">₹{itemPrice * item.quantity}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Sticky */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 bg-white rounded-[2.5rem] p-8 shadow-[0_4px_16px_rgba(224,64,160,0.15)] border-4 border-surface-container-high space-y-6">
              
              <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-tertiary" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-8 text-base">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Subtotal</span>
                  <span className="font-bold text-on-surface">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-secondary">
                    <span>Discount</span>
                    <span className="font-bold">- ₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Estimated GST (18%)</span>
                  <span className="font-bold text-on-surface">₹{tax}</span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant pb-4 border-b-2 border-surface-variant">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-on-surface">
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xl font-bold text-on-surface">Total</span>
                  <span className="text-3xl font-black text-primary">₹{total}</span>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="pt-2">
                {coupon ? (
                  <div className="flex items-center justify-between bg-surface-container p-3 rounded-lg border border-outline-variant">
                    <span className="text-xs font-bold text-secondary uppercase flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      {coupon.code}
                    </span>
                    <button 
                      onClick={removeCoupon} 
                      className="text-xs text-red-500 hover:underline font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="bg-surface-container border-0 text-sm px-4 py-2.5 rounded-full focus:ring-2 focus:ring-primary flex-grow uppercase placeholder:text-on-surface-variant/60 text-on-background"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      className="bg-secondary hover:opacity-90 text-white px-5 rounded-full text-xs font-bold transition-all"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponStatus && (
                  <p className={`text-xs mt-2 font-medium ${couponStatus.type === 'success' ? 'text-secondary' : 'text-red-500'}`}>
                    {couponStatus.message}
                  </p>
                )}
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-[#c9328c] text-white font-bold text-lg py-4 px-8 rounded-full shadow-[0_4px_16px_rgba(224,64,160,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Payment</span>
                <ArrowRight className="w-5 h-5" />
              </button>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
