'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, User, LogOut, Menu, X, Shield, ToyBrick, Truck } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { items } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = items.reduce((acc, curr) => acc + curr.quantity, 0);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return 'text-primary border-b-4 border-primary pb-1 cursor-pointer active:scale-95 transition-all font-bold';
    }
    return 'text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95 transition-all';
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md shadow-[0_4px_16px_rgba(224,64,160,0.15)] text-primary font-display font-bold tracking-tight">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform duration-200 active:scale-95 text-2xl font-black text-primary">
          <ToyBrick className="w-6 h-6 text-primary" />
          <span>CrochetCraft Pro</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 items-center text-base">
          <Link href="/" className={getLinkClass('/')}>Home</Link>
          <Link href="/products" className={getLinkClass('/products')}>Shop</Link>
          <Link href="/custom" className={getLinkClass('/custom')}>Custom</Link>
          {mounted && user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-secondary hover:text-primary transition-colors flex items-center gap-1 font-bold">
              <Shield className="w-4 h-4" />
              Admin
            </Link>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <Link href="/cart" className="relative text-primary hover:scale-105 transition-transform duration-200 cursor-pointer active:scale-95 p-2 rounded-full hover:bg-primary-container/20">
            <ShoppingBag className="w-6 h-6" />
            {mounted && cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Account */}
          {mounted && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-2 p-2 border border-outline rounded-full hover:bg-surface-container transition-colors"
              >
                <User className="w-5 h-5 text-on-background" />
                <span className="text-xs font-semibold text-on-background hidden md:inline">{user?.name}</span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-outline-variant rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 text-xs text-on-surface-variant font-bold">
                    Logged in as: <span className="text-primary">{user?.name}</span>
                  </div>
                  <hr className="my-1 border-outline-variant/50" />
                  <Link
                    href="/track-order"
                    onClick={() => setUserDropdownOpen(false)}
                    className="w-full text-left block px-4 py-2 text-sm text-on-surface hover:bg-surface-container flex items-center space-x-2"
                  >
                    <Truck className="w-4 h-4 text-primary" />
                    <span>Track Orders</span>
                  </Link>
                  <hr className="my-1 border-outline-variant/50" />
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
          ) : mounted ? (
            <Link
              href="/login"
              className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm hover:opacity-90 transition-opacity active:scale-95"
            >
              Login
            </Link>
          ) : null}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-on-background hover:text-primary"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-outline-variant p-6 flex flex-col space-y-4 md:hidden shadow-lg z-40 text-on-background">
          <Link href="/" className="font-medium" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          <Link href="/products" className="font-medium" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
          <Link href="/custom" className="font-medium" onClick={() => setMobileMenuOpen(false)}>Custom Request</Link>
          {mounted && isAuthenticated && (
            <Link href="/track-order" className="font-medium" onClick={() => setMobileMenuOpen(false)}>Track Orders</Link>
          )}
          {mounted && user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-secondary font-bold" onClick={() => setMobileMenuOpen(false)}>Admin Panel</Link>
          )}
        </div>
      )}
    </header>
  );
}
