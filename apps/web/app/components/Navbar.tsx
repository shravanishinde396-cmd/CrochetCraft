'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, Heart, User, LogOut, Menu, X, Sparkles, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-orange-100 py-4 px-6 md:px-12 flex items-center justify-between shadow-sm">
      {/* Brand logo */}
      <Link href="/" className="flex items-center space-x-2 text-2xl font-bold tracking-tight">
        <span className="text-[#E07A5F]">Crochet</span>
        <span className="text-[#81B29A] font-light">Craft</span>
        <Sparkles className="w-5 h-5 text-[#F2CC8F] fill-[#F2CC8F] animate-pulse" />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
        <Link href="/" className="text-[#3D405B] hover:text-[#E07A5F] transition-colors">Home</Link>
        <Link href="/products" className="text-[#3D405B] hover:text-[#E07A5F] transition-colors">Shop</Link>
        <Link href="/custom" className="text-[#3D405B] hover:text-[#E07A5F] transition-colors flex items-center gap-1">
          Custom Request
          <span className="bg-[#E07A5F] text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">New</span>
        </Link>
        {user?.role === 'ADMIN' && (
          <Link href="/admin" className="text-[#3D405B] hover:text-[#81B29A] transition-colors flex items-center gap-1 font-bold">
            <Shield className="w-4 h-4 text-[#81B29A]" />
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right icons */}
      <div className="flex items-center space-x-4">
        {/* Cart */}
        <Link href="/cart" className="relative p-2 text-[#3D405B] hover:text-[#E07A5F] transition-colors">
          <ShoppingBag className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#E07A5F] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Wishlist */}
        <Link href="/wishlist" className="p-2 text-[#3D405B] hover:text-[#E07A5F] transition-colors hidden sm:block">
          <Heart className="w-6 h-6" />
        </Link>

        {/* User Account */}
        {isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center space-x-2 p-2 border border-orange-100 rounded-full hover:bg-orange-50 transition-colors"
            >
              <User className="w-5 h-5 text-[#3D405B]" />
              <span className="text-xs font-semibold text-[#3D405B] hidden md:inline">{user?.name}</span>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-[#3D405B] hover:bg-orange-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm text-[#3D405B] hover:bg-orange-50"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  My Orders
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="btn-primary px-5 py-2 rounded-full text-sm font-semibold transition-all"
          >
            Login
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#3D405B] hover:text-[#E07A5F]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col space-y-4 md:hidden shadow-lg z-40">
          <Link href="/" className="text-[#3D405B] font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/products" className="text-[#3D405B] font-medium" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link href="/custom" className="text-[#3D405B] font-medium" onClick={() => setMobileMenuOpen(false)}>Custom Request</Link>
          <Link href="/wishlist" className="text-[#3D405B] font-medium" onClick={() => setMobileMenuOpen(false)}>Wishlist</Link>
          {user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-[#81B29A] font-bold" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
          )}
        </div>
      )}
    </nav>
  );
}
