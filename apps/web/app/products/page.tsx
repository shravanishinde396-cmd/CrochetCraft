'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  category?: { name: string } | null;
  bestSeller?: boolean;
}

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod1',
    title: 'Giant Berry Octopus',
    slug: 'giant-berry-octopus',
    price: 1850,
    salePrice: 1599,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCjzny_p-V0NgEN2eINhOTTaHdG2Qj8BaGfgBLtE3e_rENlnqs9PKZmoFuj1utoDzkUjHPquW75lRjg9G86uLKTcJG9MIrOQeQqkLbT6O8QHXRz0Xk72o9fwkc5or3fZM_2GyIgsPObqFQCfLOa_qaR_u8wGX87U9fUxL2SV_EiuSuHpmpvRpF3gpew6leIOUGP2iogrcdR0jOziV09Nin9Cy8LmIgE1Xv4ojFoIkYPzt9WoSsC8SLya22arFDfgL_m4xiRvONO0Q'],
    stock: 15,
    category: { name: 'Plushies' },
    bestSeller: true
  },
  {
    id: 'prod2',
    title: 'Chunky Cloud Tote',
    slug: 'chunky-cloud-tote',
    price: 2200,
    salePrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAGZ-7CS0skH-wngSJf6TJanFf8V2DF7nDvYnBHPBrxFsXrnhk-sx6OU10FWT_cN2Wlcy6bo2UKAr8EKNKYIiS8PEa5ktY_9W2pw8L8OXcqMB_0ilmwO0NnC_JE4Rp22YwCYBs1mKGmEsG2RwL-3L6UoBvVcpJ1TYwfsyO_JjnXM0g3jWbSaNmYbVdfncqC7i-pDzUzAl0hzXyzNIWs8Nm9hbE2Yt0UdZ2dLJ7Dj50vMf0tFf8HLC_t0VHb28IHK_e8QPgTQmREFw'],
    stock: 20,
    category: { name: 'Accessories' }
  },
  {
    id: 'prod3',
    title: 'Sunshine Coaster Set',
    slug: 'sunshine-coaster-set',
    price: 850,
    salePrice: null,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCQ9-RQkTM3DWzP0RoKo1VVBBVeVsBRrFAQrkKMHNyEacMYdDXLVtj7elVYFBqpeLl04XSQoVMg4mc7-iERlP0vhxya8ZH8AmN897rg7xMu0Hh8sqhwMvWpv6ActDUgtK-Eob1o5zBW7yFsifRuKC54BwAnXPW0x6CudKkx1Lo9VH_CspobQLvJ8_YzfmBAHFb27255cPMpj1oXksnagGojUpjG5QE13c-Ti1028pfMYNoq6O_gcW9ngzIW7u1RdHwC8wufKmeimQ'],
    stock: 50,
    category: { name: 'Home Decor' }
  },
  {
    id: 'prod4',
    title: 'Sweetie the Bunny',
    slug: 'sweetie-the-bunny',
    price: 1299,
    salePrice: 1099,
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCloOb2z8UzD6KaonU6e-9DKUjyoUitRh2iktUwFIgSse8J9_26Eo-ALw7L9tD0NAHKO8vXQXbKYxNkCm9p5Gr4mAvcJdghsXRhyVjaMpK7yGWaZDjhCcYebE7wxQZS1Xbt6HBNI2lh-F9rmafrNLaAeCJPa2ssBeb4OrNE8DaPPvDuD-6trjgEnL8pDqEbo_Meoh1VzWRHLh45woCKEzzyq_T1H4ARkQhQNldKyQdYvEk801lA8rGA6NdwDl_MKmuUslOCxOHpug'],
    stock: 12,
    category: { name: 'Plushies' }
  }
];

const CATEGORIES = ['All Items', 'Plushies', 'Wearables', 'Home Decor', 'Accessories'];

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('http://localhost:5000/api/v1/products');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            setProducts(data.data);
          }
        }
      } catch (error) {
        console.warn('API offline, running catalog with mock fallback products.', error);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = [...products];

    // Search query filter
    if (searchQuery) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All Items') {
      result = result.filter((p) => p.category?.name === selectedCategory);
    }

    // Price filter
    result = result.filter((p) => {
      const price = p.salePrice || p.price;
      return price <= maxPrice;
    });

    // Stock availability filter
    if (inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, sortBy, maxPrice, inStockOnly]);

  const handleResetFilters = () => {
    setSelectedCategory('All Items');
    setSearchQuery('');
    setSortBy('newest');
    setMaxPrice(3000);
    setInStockOnly(false);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pt-8">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b-2 border-surface-container-highest">
            <h2 className="text-xl font-bold text-on-background flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              Filters
            </h2>
            <button 
              onClick={handleResetFilters} 
              className="text-sm font-bold text-[#0096cc] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All
            </button>
          </div>

          {/* Search bar inside sidebar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface-container border-0 text-sm focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/60 text-on-background"
              placeholder="Search joyous crafts..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Categories select checklist */}
          <div className="bg-surface-container-lowest p-6 rounded-[20px] shadow-[0_4px_16px_rgba(124,82,170,0.05)] border border-surface-container-high">
            <h3 className="font-bold text-lg mb-4 text-[#7c52aa]">Categories</h3>
            <div className="flex flex-col gap-3">
              {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="category-radio"
                    className="form-radio h-5 w-5 text-primary border-outline-variant focus:ring-primary"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                  />
                  <span className={`group-hover:text-primary transition-colors font-medium ${selectedCategory === cat ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                    {cat}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price range selector */}
          <div className="bg-surface-container-lowest p-6 rounded-[20px] shadow-[0_4px_16px_rgba(0,150,204,0.05)] border border-surface-container-high">
            <h3 className="font-bold text-lg mb-4 text-[#0096cc]">Price Range</h3>
            <div className="flex flex-col gap-4">
              <input
                className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-tertiary"
                max="3000"
                min="0"
                step="50"
                type="range"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              />
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center bg-surface-container px-3 py-2 rounded-full w-full">
                  <span className="text-on-surface-variant text-sm mr-1">₹</span>
                  <span className="text-sm font-medium text-center w-full text-on-background">0</span>
                </div>
                <span className="text-on-surface-variant font-bold">-</span>
                <div className="flex items-center bg-surface-container px-3 py-2 rounded-full w-full">
                  <span className="text-on-surface-variant text-sm mr-1">₹</span>
                  <span className="text-sm font-medium text-center w-full text-on-background">{maxPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Availability checkbox */}
          <div className="bg-surface-container-lowest p-6 rounded-[20px] shadow-[0_4px_16px_rgba(224,64,160,0.05)] border border-surface-container-high">
            <h3 className="font-bold text-lg mb-4 text-primary">Availability</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  className="form-radio h-5 w-5 text-primary focus:ring-primary border-outline-variant"
                  name="availability-radio"
                  type="radio"
                  checked={!inStockOnly}
                  onChange={() => setInStockOnly(false)}
                />
                <span className={`group-hover:text-primary transition-colors font-medium ${!inStockOnly ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  All Items
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  className="form-radio h-5 w-5 text-primary focus:ring-primary border-outline-variant"
                  name="availability-radio"
                  type="radio"
                  checked={inStockOnly}
                  onChange={() => setInStockOnly(true)}
                />
                <span className={`group-hover:text-primary transition-colors font-medium ${inStockOnly ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  In Stock Only
                </span>
              </label>
            </div>
          </div>

          {/* Promotional Custom Request banner */}
          <div className="mt-4 rounded-[20px] p-6 bg-gradient-to-br from-primary-container to-secondary-container text-on-secondary-container shadow-[0_8px_24px_rgba(224,64,160,0.2)] hover:scale-[1.03] transition-transform cursor-pointer text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent"></div>
            <h4 className="font-bold text-lg mb-1 relative z-10">Custom Orders</h4>
            <p className="text-sm font-medium opacity-90 relative z-10">Got a wild idea? We will crochet it.</p>
            <div className="mt-4 relative z-10">
              <Link href="/custom" className="bg-white text-primary text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow inline-block">
                Inquire Now
              </Link>
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow flex flex-col gap-6">
          {/* Top Bar: Sorting & Count */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-lowest p-4 rounded-[20px] shadow-sm border border-surface-container-high">
            <div className="text-on-surface-variant font-medium">
              Showing <span className="font-bold text-primary">{filteredProducts.length}</span> joyful items
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-on-surface-variant uppercase tracking-wider">Sort By</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-surface-container text-on-background font-medium pl-4 pr-10 py-2 rounded-full border-none focus:ring-2 focus:ring-primary cursor-pointer hover:bg-surface-container-high transition-colors outline-none text-sm"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[20px] border border-outline-variant/30">
              <p className="text-lg text-on-surface-variant font-medium">No items match your selected filters.</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 bg-primary text-white px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all shadow-md"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
