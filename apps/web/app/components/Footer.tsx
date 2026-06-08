'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, Heart } from 'lucide-react';

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
    <footer className="bg-[#3D405B] text-white pt-16 pb-8 px-6 md:px-12 border-t border-orange-100">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Left branding */}
        <div className="space-y-4">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            <span className="text-[#E07A5F]">Crochet</span>
            <span className="text-[#81B29A] font-light">Craft</span>
          </Link>
          <p className="text-sm text-gray-300">
            Crafting beautiful, eco-friendly crochet items with 100% premium organic yarn. Lovingly stitched by our expert artisans to decorate your cozy space.
          </p>
        </div>

        {/* Sitemap */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-[#F2CC8F]">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/products" className="hover:text-[#E07A5F] transition-colors">Catalog</Link></li>
            <li><Link href="/custom" className="hover:text-[#E07A5F] transition-colors">Custom Order Inquiry</Link></li>
            <li><Link href="/about" className="hover:text-[#E07A5F] transition-colors">Our Story & Artisans</Link></li>
            <li><Link href="/faq" className="hover:text-[#E07A5F] transition-colors">Shipping & FAQ</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-[#F2CC8F]">Get in Touch</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#E07A5F]" />
              <span>Bangalore, Karnataka, India</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-[#81B29A]" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#81B29A]" />
              <span>support@crochetcraftpro.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-bold mb-4 text-[#F2CC8F]">Our Newsletter</h3>
          <p className="text-sm text-gray-300 mb-4">Subscribe to receive launch previews, discount coupons, and restocking news.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col space-y-2">
            <div className="flex bg-white/10 rounded-lg overflow-hidden border border-white/20">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-0 px-4 py-2 text-sm focus:outline-none focus:ring-0 flex-grow placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-[#E07A5F] hover:bg-[#d45f43] p-2 text-white transition-colors flex items-center justify-center w-10"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {status && <p className="text-xs text-[#81B29A]">{status}</p>}
          </form>
        </div>
      </div>

      <hr className="border-white/10 my-8" />

      {/* Copy and credits */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 space-y-4 sm:space-y-0">
        <p>&copy; {new Date().getFullYear()} CrochetCraft Pro. All rights reserved.</p>
        <p className="flex items-center">
          Made with <Heart className="w-3.5 h-3.5 text-[#E07A5F] fill-[#E07A5F] mx-1 animate-pulse" /> in India
        </p>
      </div>
    </footer>
  );
}
