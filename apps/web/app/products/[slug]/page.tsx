'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useCartStore, CartProduct } from '../../store/cartStore';
import { ShoppingBag, ArrowLeft, Star, RefreshCw } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { API_BASE } from '../../utils/apiFetch';

interface Product {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice: number | null;
  images: string[];
  stock: number;
  description: string;
  material?: string;
  careInstructions?: string;
  weight?: string;
  dimensions?: string;
  category?: { name: string } | null;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { addItem } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'materials' | 'care'>('details');
  const [selectedColor, setSelectedColor] = useState<string>('Candy Pink');
  const [customText, setCustomText] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [mainImage, setMainImage] = useState<string>('');

  const colors = [
    { name: 'Candy Pink', hex: '#f080c0' },
    { name: 'Lilac Purple', hex: '#7c52aa' },
    { name: 'Mint Green', hex: '#81B29A' },
    { name: 'Cream White', hex: '#F4F1DE' }
  ];

  useEffect(() => {
    if (!slug) return;
    
    async function loadData() {
      setLoading(true);
      try {
        // Fetch single product
        const res = await fetch(`${API_BASE}/api/v1/products/${slug}`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.data) {
            setProduct(resData.data);
            if (resData.data.images?.length > 0) {
              setMainImage(resData.data.images[0]);
            }
          }
        }
        
        // Fetch related products
        const relRes = await fetch(`${API_BASE}/api/v1/products/${slug}/related`);
        if (relRes.ok) {
          const relData = await relRes.json();
          if (relData.success && Array.isArray(relData.data)) {
            setRelatedProducts(relData.data);
          }
        }
      } catch (err) {
        console.error('Error fetching product details from API, using client fallback.', err);
        // Fallback for "sweetie-the-bunny" if API fails or seed is not loaded
        if (slug === 'sweetie-the-bunny') {
          const fallbackBunny: Product = {
            id: 'bunny-sweetie',
            title: 'Sweetie the Bunny',
            slug: 'sweetie-the-bunny',
            price: 1299,
            salePrice: 1099,
            images: [
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCloOb2z8UzD6KaonU6e-9DKUjyoUitRh2iktUwFIgSse8J9_26Eo-ALw7L9tD0NAHKO8vXQXbKYxNkCm9p5Gr4mAvcJdghsXRhyVjaMpK7yGWaZDjhCcYebE7wxQZS1Xbt6HBNI2lh-F9rmafrNLaAeCJPa2ssBeb4OrNE8DaPPvDuD-6trjgEnL8pDqEbo_Meoh1VzWRHLh45woCKEzzyq_T1H4ARkQhQNldKyQdYvEk801lA8rGA6NdwDl_MKmuUslOCxOHpug',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCqMrN1CZCqo3AWpNa9Ox3VOn1kQ-4RSxEkKaY28yaZilJ-g6Yf4isrAwn5wYypllFViYTjTMIru-unULqcPR4IhnPj2mS9A-aHWHqe2CLf4GtWCPrMW_kKzsVLiNDkWh3l1twyONtnr86-pzzuGMfugMNlMlL65Vgw8Ldg_1XjmnNn0_jb4yJjdRYIPL3m9Eu81To1UJn0SoEnllW9NVne6_WIRw5SPMjQODvmOl7m-9_B0eH09VVG0eXaEz8bORLXDqAMyiHL-g'
            ],
            stock: 12,
            description: 'Meet Sweetie, our signature handwoven bunny! Hand-stitched with love using premium hypoallergenic milk cotton yarn. Perfect for warm snuggles, nursery decor, and thoughtful baby shower gifting.',
            material: '100% Organic Milk Cotton Yarn, Polyester stuffing, Safety eyes.',
            careInstructions: 'Handwash gently with baby detergent in lukewarm water. Lay flat to dry.',
            weight: '180g',
            dimensions: '22cm x 12cm',
            category: { name: 'Plushies' }
          };
          setProduct(fallbackBunny);
          setMainImage(fallbackBunny.images[0]);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-bold">Unspooling your craft details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6 space-y-6">
        <h2 className="text-2xl font-black text-on-surface font-headline">Craft Not Found</h2>
        <p className="text-on-surface-variant">We could not locate the specific item you requested.</p>
        <Link href="/products" className="bg-primary text-white font-bold py-3 px-6 rounded-full inline-block">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const currentPrice = product.salePrice || product.price;
  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    // Add custom specifications inside customText / color tags if provided
    const cartProduct: CartProduct = {
      id: product.id,
      title: `${product.title} (${selectedColor}${customText ? ` - "${customText}"` : ''})`,
      slug: product.slug,
      price: product.price,
      salePrice: product.salePrice,
      images: product.images,
      stock: product.stock,
    };
    
    addItem(cartProduct, quantity);
    router.push('/cart');
  };

  return (
    <div className="bg-background text-on-background min-h-screen pt-8 pb-16 font-body">
      <main className="max-w-7xl mx-auto px-6 space-y-16">
        
        {/* Back Link */}
        <div className="flex items-center">
          <Link href="/products" className="inline-flex items-center gap-2 text-primary font-bold hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Link>
        </div>

        {/* Product Information Panel */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Product Images */}
          <div className="lg:col-span-6 space-y-4">
            <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_8px_32px_rgba(224,64,160,0.15)] border-4 border-white relative bg-surface-container">
              <Image 
                alt={product.title} 
                className="object-cover transition-transform duration-500 hover:scale-105" 
                src={mainImage || 'https://via.placeholder.com/600'} 
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <span className="absolute top-4 left-4 bg-secondary text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md">
                Handmade
              </span>
            </div>

            {/* Thumbnail Gallery */}
            {product.images?.length > 1 && (
              <div className="flex gap-4">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(img)}
                    className={`w-24 h-20 rounded-2xl overflow-hidden border-2 transition-all relative ${
                      mainImage === img ? 'border-primary scale-105' : 'border-outline-variant/40 opacity-70'
                    }`}
                  >
                    <Image alt="Thumbnail" className="object-cover" src={img} fill sizes="96px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Spec Controls */}
          <div className="lg:col-span-6 space-y-6">
            
            <div>
              {product.category && (
                <span className="text-sm font-black text-tertiary uppercase tracking-widest mb-2 block">
                  {product.category.name}
                </span>
              )}
              <h1 className="text-4xl md:text-5xl font-black font-headline text-on-surface mb-2 leading-tight">
                {product.title}
              </h1>
              
              <div className="flex items-center gap-2 mt-3">
                <div className="flex text-secondary fill-current">
                  <Star className="w-4 h-4 fill-secondary" />
                  <Star className="w-4 h-4 fill-secondary" />
                  <Star className="w-4 h-4 fill-secondary" />
                  <Star className="w-4 h-4 fill-secondary" />
                  <Star className="w-4 h-4 fill-secondary text-outline-variant" />
                </div>
                <span className="text-xs font-bold text-on-surface-variant">(4.9 out of 5 from 24 yarn givers)</span>
              </div>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-4 py-2 border-y border-outline-variant/30">
              <span className="text-4xl font-black text-primary">₹{currentPrice}</span>
              {product.salePrice && (
                <span className="text-lg text-outline line-through">₹{product.price}</span>
              )}
            </div>

            <p className="text-on-surface-variant leading-relaxed text-base">
              {product.description}
            </p>

            {/* Spec: Color Picker */}
            <div className="space-y-3">
              <span className="text-sm font-black text-on-surface uppercase tracking-wider">Choose Custom Color</span>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                      selectedColor === color.name 
                        ? 'border-primary bg-primary-container/20 text-primary scale-105 shadow-sm'
                        : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: color.hex }}></span>
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes input box */}
            <div className="space-y-2">
              <label className="text-sm font-black text-on-surface uppercase tracking-wider block">Customization Text (Optional)</label>
              <input 
                placeholder="e.g. Please embroider 'Sweetie' on the left ear" 
                className="w-full px-5 py-3 rounded-full bg-surface-container border-0 text-sm focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/60 text-on-background shadow-inner" 
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
              />
            </div>

            {/* Quantity Selector and Add-to-cart Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <div className="flex items-center bg-surface-container rounded-full p-1 border border-outline-variant shadow-inner shrink-0">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-on-surface text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-white hover:text-primary transition-colors"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full font-bold py-4 px-8 rounded-full flex items-center justify-center gap-3 transition-all ${
                  isOutOfStock
                    ? 'bg-surface-variant text-outline cursor-not-allowed'
                    : 'bg-primary hover:bg-[#c9328c] text-white shadow-[0_8px_24px_rgba(224,64,160,0.25)] active:scale-95'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Cart Bundle'}</span>
              </button>
            </div>

            {/* Information Tabs */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 shadow-sm mt-8 space-y-4">
              <div className="flex border-b border-outline-variant/20 gap-4 text-sm font-bold text-on-surface-variant pb-2">
                <button 
                  onClick={() => setActiveTab('details')}
                  className={`pb-1 ${activeTab === 'details' ? 'text-primary border-b-2 border-primary' : ''}`}
                >
                  Details
                </button>
                <button 
                  onClick={() => setActiveTab('materials')}
                  className={`pb-1 ${activeTab === 'materials' ? 'text-primary border-b-2 border-primary' : ''}`}
                >
                  Material
                </button>
                <button 
                  onClick={() => setActiveTab('care')}
                  className={`pb-1 ${activeTab === 'care' ? 'text-primary border-b-2 border-primary' : ''}`}
                >
                  Care Instructions
                </button>
              </div>

              <div className="text-sm text-on-surface-variant leading-relaxed min-h-[60px]">
                {activeTab === 'details' && (
                  <div className="space-y-1">
                    <p><strong>Weight:</strong> {product.weight || '150g'}</p>
                    <p><strong>Dimensions:</strong> {product.dimensions || 'Standard size'}</p>
                    <p><strong>Availability:</strong> {product.stock > 0 ? 'Stitched & Ready to Ship' : 'Pre-order slot required'}</p>
                  </div>
                )}
                {activeTab === 'materials' && (
                  <p>{product.material || 'Premium organic milk cotton yarn, anti-bacterial fiberfill padding.'}</p>
                )}
                {activeTab === 'care' && (
                  <p>{product.careInstructions || 'Hand wash using gentle fabric softeners. Do not tumble dry. Dry flat in shade.'}</p>
                )}
              </div>
            </div>

          </div>
        </section>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-outline-variant/20">
            <h2 className="text-3xl font-black text-on-surface mb-8 font-headline">Other Joyous Finds</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
