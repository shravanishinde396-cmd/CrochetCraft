'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, ToyBrick } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const response = await fetch('http://localhost:5000/api/v1/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus('Successfully subscribed! Welcome!');
        setEmail('');
      } else {
        setStatus(data.message || 'Subscription failed.');
      }
    } catch {
      setStatus('Unable to connect to subscriber service.');
    }
  };

  return (
    <footer className="bg-surface-container-highest w-full rounded-t-[3rem] mt-auto font-body text-sm border-t border-outline-variant/30">
      <div className="max-w-7xl mx-auto px-12 py-16 flex flex-col gap-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="text-xl font-black text-primary flex items-center gap-2">
            <ToyBrick className="w-6 h-6 text-primary" />
            <span>CrochetCraft Pro</span>
          </div>

          <nav className="flex flex-wrap gap-6 text-sm font-medium">
            <Link href="/" className="text-on-surface-variant hover:text-secondary hover:underline transition-opacity hover:opacity-80">
              Home
            </Link>
            <Link href="/products" className="text-on-surface-variant hover:text-secondary hover:underline transition-opacity hover:opacity-80">
              Shop
            </Link>
            <Link href="/custom" className="text-on-surface-variant hover:text-secondary hover:underline transition-opacity hover:opacity-80">
              Custom Orders
            </Link>
            <Link href="/cart" className="text-on-surface-variant hover:text-secondary hover:underline transition-opacity hover:opacity-80">
              My Cart
            </Link>
          </nav>
        </div>

        {/* Newsletter subscribe form */}
        <div className="max-w-md bg-white/50 backdrop-blur p-6 rounded-2xl border border-outline-variant/30 flex flex-col gap-3">
          <h4 className="font-bold text-on-background text-base">Subscribe to our newsletter</h4>
          <p className="text-xs text-on-surface-variant">Stay updated with new custom collections and restocks!</p>
          <form onSubmit={handleSubscribe} className="flex gap-2 bg-white rounded-full overflow-hidden border border-outline-variant p-1 shadow-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-transparent border-0 px-4 py-2 text-sm focus:outline-none focus:ring-0 flex-grow placeholder-on-surface-variant/60 text-on-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-primary text-white p-2 rounded-full hover:bg-surface-tint transition-colors flex items-center justify-center w-10 h-10"
              aria-label="Subscribe"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          {status && <p className="text-xs font-medium text-secondary mt-1">{status}</p>}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-on-surface-variant opacity-80 border-t border-outline-variant/20 pt-8 gap-4">
          <div>
            © {new Date().getFullYear()} CrochetCraft Pro. Handmade with Joy.
          </div>
          <div>
            Made with Love in India
          </div>
        </div>
      </div>
    </footer>
  );
}
