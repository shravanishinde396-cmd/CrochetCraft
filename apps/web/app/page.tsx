'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from './components/ProductCard';
import { ArrowRight, Heart, Palette, Leaf } from 'lucide-react';
import { API_BASE } from './utils/apiFetch';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  category?: { name: string };
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const response = await fetch(`${API_BASE}/api/v1/products?limit=4`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
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
    <div className="bg-background text-on-background font-body pt-8 min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 pb-24 space-y-32">
        
        {/* Hero Section */}
        <section className="relative rounded-xl overflow-hidden mt-8 shadow-[0_8px_24px_rgba(224,64,160,0.2)] hover:scale-[1.01] transition-transform duration-300 group">
          <img 
            alt="Hero Image" 
            className="w-full h-[550px] object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIkceQ9T6c3Hw4N8zfUdc8QAx4gN7jsujbZJjMS-jUN7itjsOQZwejI9jfEt_lq6xE4-906zRc65rRkMIe8mb4yUof1SGqXqbB6hGhxrHy8PQPiwu4uCsqXnfvi0joXfgJtzlRq7PfzFB-xuaVXhKXeyX1iBV5KG1dm-bTDNGlsH1MqXhoWicIeTIwz5rm5nZwEWNo4HmtbEVhONMDVfgpDZAEkn5_ctz8ANxoJyfSbzKCh7M_UZNMF4m08fspyEYkPyNP8SW0rg" 
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent flex items-center">
            <div className="p-8 md:p-20 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black font-headline text-on-background mb-6 leading-tight">
                Handmade with <span className="text-primary">Joy</span>
              </h1>
              <p className="text-lg text-on-surface-variant mb-10 leading-relaxed font-medium">
                Discover premium, playful crochet creations designed to bring a pop of color to your world. From adorable amigurumi to cozy wearables.
              </p>
              <Link 
                href="/products" 
                className="inline-flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_4px_16px_rgba(224,64,160,0.3)] w-max"
              >
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Categories (Bento Grid) */}
        <section>
          <h2 className="text-4xl font-bold font-headline text-center mb-12 text-secondary">Explore Our Craft</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2 relative rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-[0_8px_24px_rgba(224,64,160,0.15)] group cursor-pointer h-96">
              <img 
                alt="Amigurumi" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBHVp06Ne8gd87UtW5QtGmr2pQ5q5Q5uM8QETuPOY-YKqInbbkysn-UYTnCV0Is1NtLWpR2iP5Zg_kbomqe1wx1CSUcv6KYShE4lPvp9zrclTOrIMT9R_f8cEPsA1R29fNBumiVMOCBXgdvRJuZ5Zm1LOKOwVxHU1Xrl_9AzfFwuJ3Vvze6NDF8kn0_PQIt2RoEmEFCqlrLIMONcfBcDQ8Q_0F1PmIs69PlAWFqg1JXX43b_TrX0X7DCAZzHm2JWKX8Nvut9Bsng" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 to-transparent flex flex-col justify-end p-8">
                <span className="bg-primary text-on-primary px-4 py-1.5 rounded-full text-xs font-bold w-max mb-3">Popular</span>
                <h3 className="text-3xl font-bold text-surface mb-2 font-display">Amigurumi</h3>
                <p className="text-surface-variant text-sm">Cute companions for all ages.</p>
              </div>
            </div>
            
            <div className="relative rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-300 shadow-[0_8px_24px_rgba(124,82,170,0.15)] group cursor-pointer h-96">
              <img 
                alt="Home Decor" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrWziYvRHDGFKUsCxI4gAf5oD6g_ct3cpuLiNYft5iHYGGgC91jXj1VX-giSHHXbbhK6MqbLWNP1mBwxZJI9yRsdPEfs9TJGo-4EgA4MHcQkQhAWB8lI3bzSWJB7XXa9ny6BB60F3myAffwDj-hL3BaO0IuVy14-kG5DrY_1nXsNlblw_xfsZqvVTQ55DvxRw-eQZg5D-gftpbkj11X1-kBCsEpcpXv4PF88bHtLO2brzgaS5lOU8I3mWgPMOiuMlcTevUT60GYA" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 to-transparent flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-surface mb-2 font-display">Home Decor</h3>
                <p className="text-surface-variant text-sm">Cozy up your space.</p>
              </div>
            </div>

            <div className="col-span-1 md:col-span-3 relative rounded-xl overflow-hidden hover:scale-[1.01] transition-transform duration-300 shadow-[0_8px_24px_rgba(0,150,204,0.15)] group cursor-pointer h-64">
              <img 
                alt="Wearables" 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_SvODx-iJHv8AKRsNTJdVgUk4rT7feeN9zZF1ds7v0hWRAQl02Ft8H7IVUh0PoEU2A7eT0yuAicWBLauIkgMYDd2xht-9ZNyLgMGCDnGJbMz3-rBdyIUt3p7xG0xj6vOTpElsip5lQw1_ACL8MhtnVsxmYmzDh2CTytdQctHUie_WKev_kw7E6GbUHfn8nlfq-DlYKMqSwan5LUJnAc3_CvJSXfTynjJI_uLKPz7tiw9n4_D8KwXeie8yN7bs6BrmHODq5BAfOA" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-on-background/80 to-transparent flex flex-col justify-center p-8 md:p-16">
                <h3 className="text-3xl font-bold text-surface mb-2 font-display">Wearables</h3>
                <p className="text-surface-variant mb-6 max-w-md text-sm">Stylish, chunky knits and accessories to keep you vibrant and warm.</p>
                <Link 
                  href="/products" 
                  className="bg-tertiary text-on-tertiary px-6 py-2.5 rounded-full font-bold w-max hover:bg-tertiary-container hover:text-on-tertiary-container transition-colors text-sm"
                >
                  Explore Category
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Best Sellers */}
        <section className="bg-surface-container-low rounded-xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-fixed rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-tertiary-fixed rounded-full blur-3xl opacity-50 -ml-20 -mb-20 pointer-events-none"></div>
          
          <div className="relative z-10 flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-bold font-headline text-on-background mb-2">Fresh Out the Loop</h2>
              <p className="text-on-surface-variant text-sm font-medium">Discover our newest handmade treasures.</p>
            </div>
            <Link href="/products" className="text-primary font-bold hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Value Proposition */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold font-headline text-on-background leading-tight">
              Why Choose <span className="text-secondary relative inline-block">Handmade?<span className="absolute bottom-1 left-0 w-full h-3 bg-secondary-fixed -z-10 rounded-full"></span></span>
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed">
              In a world of mass production, CrochetCraft Pro stands for uniqueness, quality, and joy. Every single stitch is placed with intention, creating pieces that are not just items, but companions and statement pieces.
            </p>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="bg-primary-fixed text-primary p-3 rounded-full flex-shrink-0">
                  <Heart className="w-6 h-6 text-primary fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-1 text-on-background">Crafted with Love</h4>
                  <p className="text-on-surface-variant text-sm">Each piece takes hours of dedicated focus, ensuring unmatched quality and attention to detail.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-tertiary-fixed text-tertiary p-3 rounded-full flex-shrink-0">
                  <Palette className="w-6 h-6 text-tertiary" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-1 text-on-background">Premium Materials</h4>
                  <p className="text-on-surface-variant text-sm">We source only the softest, most vibrant, and durable yarns to bring our joyful designs to life.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-secondary-fixed text-secondary p-3 rounded-full flex-shrink-0">
                  <Leaf className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h4 className="font-bold text-xl mb-1 text-on-background">Sustainable Joy</h4>
                  <p className="text-on-surface-variant text-sm">Handmade means slow fashion. Built to last, cherished forever, and better for the planet.</p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="relative h-[550px] rounded-xl overflow-hidden shadow-[0_8px_24px_rgba(124,82,170,0.2)]">
            <img 
              alt="Crafting Process" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkgigYp-DgEhgz-ZOI5n669bGZdXwanfbkI1qRVIMTCLT_6UD77iGS5g71nR44isbdQgNsgfKQi1rY2A6xDZAZisQNnXPvn364k31Oigpcv1-gFzryyFfLK1ZDQ1jPSnezI_xNBMLqWvOL9FcRwJWrh09c3o0OiAbaFXLmzkWEH0qN_rukX_gnqo43zHdo6p1gKVMAo6YNmioazNezEjKrTVkFVdJBJu8vbE2PAMqDByojl6Isoxk7MGarECle4PPE6kFK8sSYUw" 
            />
            <div className="absolute inset-0 bg-secondary/10 pointer-events-none" />
          </div>
        </section>

      </main>
    </div>
  );
}
