'use client';

import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, Search } from 'lucide-react';

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
  {
    id: 'prod5',
    title: 'Chubby Yellow Bee Amigurumi',
    slug: 'chubby-yellow-bee-amigurumi',
    price: 399,
    salePrice: 299,
    images: ['https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80'],
    stock: 8,
    category: { name: 'Plush Toys & Amigurumi' },
  },
  {
    id: 'prod6',
    title: 'Cotton Candy Crochet Headband',
    slug: 'cotton-candy-crochet-headband',
    price: 199,
    salePrice: null,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'],
    stock: 35,
    category: { name: 'Keychains & Accessories' },
  },
];

const CATEGORIES = [
  'All Crafts',
  'Bouquets & Flowers',
  'Plush Toys & Amigurumi',
  'Keychains & Accessories',
  'Home Decor & Coasters',
];

export default function Catalog() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All Crafts');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(1500);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5000/api/v1/products');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setProducts(data.data);
            setFilteredProducts(data.data);
          }
        }
      } catch (error) {
        console.warn('API offline, running catalog with mock data.', error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    // Search query filter
    if (searchQuery) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All Crafts') {
      result = result.filter((p) => p.category?.name === selectedCategory);
    }

    // Price filter
    result = result.filter((p) => {
      const price = p.salePrice || p.price;
      return price <= maxPrice;
    });

    // Sorting
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, sortBy, maxPrice]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#3D405B]">Aesthetic Handcrafted Catalog</h1>
        <p className="text-sm text-gray-500 mt-1">Explore all premium handmade items crafted by local weavers.</p>
      </div>

      {/* Catalog Grid Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="bg-white p-6 rounded-2xl border border-orange-50/50 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-orange-50">
            <span className="font-bold text-[#3D405B] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E07A5F]" />
              Filters
            </span>
            <button
              onClick={() => {
                setSelectedCategory('All Crafts');
                setSearchQuery('');
                setSortBy('default');
                setMaxPrice(1500);
              }}
              className="text-xs text-[#E07A5F] hover:underline font-bold"
            >
              Reset All
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search crafts..."
              className="w-full bg-orange-50/50 border-0 text-sm px-4 py-2.5 pl-10 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#E07A5F]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
          </div>

          {/* Categories list */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#3D405B] uppercase tracking-wider">Categories</h4>
            <div className="flex flex-col space-y-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-left text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${
                    selectedCategory === cat
                      ? 'bg-orange-50 text-[#E07A5F]'
                      : 'text-gray-600 hover:bg-orange-50/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <h4 className="text-xs font-bold text-[#3D405B] uppercase tracking-wider">Max Price</h4>
              <span className="text-sm font-bold text-[#E07A5F]">Rs. {maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              className="w-full accent-[#E07A5F]"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            />
          </div>
        </aside>

        {/* Catalog List */}
        <section className="lg:col-span-3 space-y-6">
          {/* Top sorting controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-orange-50/50">
            <span className="text-xs text-gray-500 font-medium">
              Showing {filteredProducts.length} unique crafts
            </span>
            <div className="flex items-center space-x-3 text-sm">
              <SlidersHorizontal className="w-4 h-4 text-[#81B29A]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 focus:ring-0 text-[#3D405B] font-bold text-xs"
              >
                <option value="default">Default Sort</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>

          {/* Products grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-orange-50">
              <p className="text-lg text-gray-500 font-medium">No crafts match your filters.</p>
              <button
                onClick={() => {
                  setSelectedCategory('All Crafts');
                  setSearchQuery('');
                  setMaxPrice(1500);
                }}
                className="mt-4 btn-primary px-6 py-2.5 rounded-full text-sm font-bold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
