'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Trash2, Plus, Minus, Tag, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, subtotal, discount, shipping, tax, total, coupon, updateQuantity, removeItem, applyCoupon, removeCoupon, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    setCouponStatus(null);
    try {
      const response = await fetch('http://localhost:5000/api/v1/coupons/validate', {
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
    // In a real flow, we would hit POST /orders, initiate Razorpay payment checkout, etc.
    alert('Checkout successfully initiated! In a production environment, this will trigger the Razorpay payment gate window.');
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6 space-y-6">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-[#E07A5F]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#3D405B]">Your Shopping Cart is Empty</h2>
          <p className="text-sm text-gray-500">Add some beautiful hand-woven crafts to start your premium bundle.</p>
        </div>
        <Link href="/products" className="btn-primary inline-block px-8 py-3 rounded-full text-base font-bold shadow-md">
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <h1 className="text-3xl font-extrabold text-[#3D405B] mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = item.product.salePrice || item.product.price;
            return (
              <div key={item.product.id} className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-orange-50/50 shadow-sm">
                <img
                  src={item.product.images?.[0]}
                  alt={item.product.title}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-50"
                />
                <div className="flex-grow">
                  <h3 className="font-bold text-[#3D405B] text-base line-clamp-1">{item.product.title}</h3>
                  <p className="text-sm text-[#E07A5F] font-bold mt-1">Rs. {price}</p>
                </div>
                {/* Quantity Controls */}
                <div className="flex items-center space-x-2 border border-orange-100 rounded-lg p-1">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 hover:bg-orange-50 text-gray-500 rounded"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 hover:bg-orange-50 text-gray-500 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {/* Remove */}
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Order Summary Panel */}
        <aside className="bg-white p-6 rounded-2xl border border-orange-50/50 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#3D405B] pb-3 border-b border-orange-50">Order Summary</h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="font-medium text-[#3D405B]">Rs. {subtotal}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>- Rs. {discount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500">
              <span>Estimated GST (18%)</span>
              <span className="font-medium text-[#3D405B]">Rs. {tax}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping Fee</span>
              <span className="font-medium text-[#3D405B]">
                {shipping === 0 ? 'FREE' : `Rs. ${shipping}`}
              </span>
            </div>
            <hr className="border-orange-50" />
            <div className="flex justify-between text-base font-bold text-[#3D405B] pt-2">
              <span>Grand Total</span>
              <span className="text-xl text-[#E07A5F]">Rs. {total}</span>
            </div>
          </div>

          {/* Coupon Code section */}
          <div className="pt-2">
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 p-2.5 rounded-lg border border-green-200">
                <span className="text-xs font-bold text-green-700 uppercase flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {coupon.code}
                </span>
                <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Coupon code"
                  className="bg-orange-50/30 border-0 text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E07A5F] flex-grow uppercase placeholder-gray-400"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="bg-[#81B29A] hover:bg-[#72a38b] text-white px-4 rounded-lg text-xs font-bold transition-colors">
                  Apply
                </button>
              </form>
            )}
            {couponStatus && (
              <p className={`text-xs mt-1.5 ${couponStatus.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                {couponStatus.message}
              </p>
            )}
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleCheckout}
            className="w-full btn-primary py-3 rounded-full text-base font-bold flex items-center justify-center gap-2 group transition-all"
          >
            <span>Proceed to Payment</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </aside>
      </div>
    </div>
  );
}
