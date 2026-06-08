'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from './components/ProductCard';
import { Sparkles, Heart, Gift, ShieldCheck, ArrowRight, Star } from 'lucide-react';

// Premium fallback mock products matching our seed database
const MOCK_PRODUCTS = [
  {
    id: 'prod1',
    title: 'Fluffy Crochet Tulip Bouquet',
    slug: 'fluffy-crochet-tulip-bouquet',
    price: 999,
    salePrice: 799,
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'],
    stock: 15,
    category: { name: 'Bouquets & Flowers' },
  },
  {
    id: 'prod2',
    title: 'Adorable Crochet Chubby Penguin',
    slug: 'adorable-crochet-chubby-penguin',
    price: 499,
    salePrice: null,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'],
    stock: 20,
    category: { name: 'Plush Toys & Amigurumi' },
  },
  {
    id: 'prod3',
    title: 'Pastel Crochet Flower Keychain',
    slug: 'pastel-crochet-flower-keychain',
    price: 249,
    salePrice: 199,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'],
    stock: 50,
    category: { name: 'Keychains & Accessories' },
  },
  {
    id: 'prod4',
    title: 'Aesthetic Sage Leaf Coaster Set',
    slug: 'aesthetic-sage-leaf-coaster-set',
    price: 349,
    salePrice: null,
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80'],
    stock: 12,
    category: { name: 'Home Decor & Coasters' },
  },
];

const TESTIMONIALS = [
  {
    name: 'Sneha R.',
    rating: 5,
    comment: 'The tulip bouquet is absolutely stunning! The stitches are perfect and it looks so real in my ceramic vase. Highly recommend!',
  },
  {
    name: 'Vikram M.',
    rating: 5,
    comment: 'Ordered a custom crochet replica of my dog. The team was extremely accommodating, gave a fair quote, and the result is adorable.',
  },
  {
    name: 'Aditi P.',
    rating: 5,
    comment: 'Best quality yarn crafts online. They are soft, sturdy, and do not lose their structure. Gifting these is an absolute joy!',
  },
];

export default function Home() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch('http://localhost:5000/api/v1/products?limit=4');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setProducts(data.data);
          }
        }
      } catch (error) {
        console.warn('API not reachable. Falling back to local mock products.', error);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#F4F1DE]/40 via-white to-orange-50/40 py-24 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-orange-100/60 text-[#E07A5F] px-4 py-1.5 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>100% Organic Handwoven Yarn</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-[#3D405B] leading-[1.15]">
              Stitched with Love, <br />
              <span className="text-gradient">Crafted for Joy</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
              Explore our premium collection of aesthetic flowers, bouquets, custom amigurumi, and coasters made with the finest organic yarn and unmatched care.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/products" className="btn-primary px-8 py-3 rounded-full text-base font-bold shadow-md">
                Explore Catalog
              </Link>
              <Link href="/custom" className="btn-secondary px-8 py-3 rounded-full text-base font-bold shadow-md">
                Custom Requests
              </Link>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-orange-100/80">
              <div>
                <h4 className="text-2xl md:text-3xl font-extrabold text-[#3D405B]">10k+</h4>
                <p className="text-xs text-gray-500 font-medium mt-1">Stitches per Bouquet</p>
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-extrabold text-[#3D405B]">5000+</h4>
                <p className="text-xs text-gray-500 font-medium mt-1">Happy Givers</p>
              </div>
              <div>
                <h4 className="text-2xl md:text-3xl font-extrabold text-[#3D405B]">4.9★</h4>
                <p className="text-xs text-gray-500 font-medium mt-1">Artisan Reviews</p>
              </div>
            </div>
          </div>
          {/* Hero Image */}
          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#81B29A]/10 to-[#E07A5F]/10 rounded-full blur-3xl -z-10" />
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white aspect-[4/3] w-full max-w-xl group">
              <img
                src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1000&auto=format&fit=crop&q=80"
                alt="Aesthetic crochet workspace with pastel yarn balls and needles"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl border border-orange-50/50 shadow-sm">
          <div className="p-3 bg-orange-100/50 text-[#E07A5F] rounded-xl">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#3D405B] text-lg">100% Handcrafted</h3>
            <p className="text-sm text-gray-500 mt-1">Every item is single-handedly stitched by certified local artisans with absolute care.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl border border-orange-50/50 shadow-sm">
          <div className="p-3 bg-green-100/50 text-[#81B29A] rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#3D405B] text-lg">Organic Milk Yarn</h3>
            <p className="text-sm text-gray-500 mt-1">We utilize certified toxin-free organic milk cotton yarn safe for kids and toddlers.</p>
          </div>
        </div>
        <div className="flex items-start space-x-4 p-6 bg-white rounded-2xl border border-orange-50/50 shadow-sm">
          <div className="p-3 bg-yellow-100/50 text-[#F2CC8F] rounded-xl">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-[#3D405B] text-lg">Premium Gifting</h3>
            <p className="text-sm text-gray-500 mt-1">All orders arrive in personalized ribboned boxes with handwritten cards ready to gift.</p>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#3D405B]">Aesthetic Best Sellers</h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked collection of our most loved crochet masterpieces.</p>
          </div>
          <Link href="/products" className="text-[#E07A5F] hover:text-[#d45f43] font-bold text-sm flex items-center gap-1 group">
            <span>View All Crafts</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Custom Request CTA */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="bg-[#3D405B] rounded-3xl overflow-hidden relative shadow-lg text-white p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
          <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial-gradient from-white/5 to-transparent pointer-events-none" />
          <div className="space-y-6 md:w-2/3">
            <span className="text-xs uppercase font-extrabold tracking-widest text-[#F2CC8F] bg-white/10 px-3.5 py-1.5 rounded-full">
              Made-To-Order Design Slots
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
              Have a Custom Yarn <br />
              Design Idea in Mind?
            </h2>
            <p className="text-gray-300 max-w-lg leading-relaxed">
              Submit reference images, specifications, and color patterns. Our head designer will review and issue a quotation within 24 hours.
            </p>
            <div className="pt-2">
              <Link href="/custom" className="btn-primary px-8 py-3 rounded-full text-base font-bold shadow-md bg-[#E07A5F] hover:bg-[#d45f43]">
                Submit Custom Request
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative max-w-xs aspect-square w-full rounded-2xl overflow-hidden border-4 border-white/20 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80"
                alt="Artisan sewing custom penguin plush amigurumi"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-extrabold text-[#3D405B]">Loved by Crochet Lovers</h2>
          <p className="text-sm text-gray-500">Read what our happy customers are saying about our yarn quality and finish.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-orange-50 shadow-sm flex flex-col justify-between">
              <p className="text-sm text-gray-600 italic leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
              <div className="mt-6 flex items-center justify-between border-t border-orange-50/50 pt-4">
                <span className="font-bold text-[#3D405B] text-sm">{t.name}</span>
                <div className="flex text-[#F2CC8F]">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
