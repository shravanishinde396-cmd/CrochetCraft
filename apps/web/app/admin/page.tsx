'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { apiFetch } from '../utils/apiFetch';
import { ShieldAlert, BarChart3, Package, HeartHandshake, Tag, Plus, Edit, Trash2, X, RefreshCw } from 'lucide-react';

const MOCK_STATS = {
  stats: {
    totalUsers: 145,
    totalProducts: 20,
    totalOrders: 68,
    totalRevenue: 54300,
    pendingCustomOrders: 3,
  },
  recentOrders: [
    { id: '1', orderNumber: 'CC-2606-MOCK01', total: 1200, orderStatus: 'PENDING', createdAt: '2026-06-08T09:00:00Z' },
    { id: '2', orderNumber: 'CC-2606-MOCK02', total: 799, orderStatus: 'CONFIRMED', createdAt: '2026-06-08T08:30:00Z' },
  ],
  lowStockProducts: [
    { id: 'prod4', title: 'Aesthetic Sage Leaf Coaster Set', stock: 3, sku: 'YARN-COAST-SAGE' },
  ],
};

const DEFAULT_PRODUCT_FORM = {
  title: '',
  slug: '',
  description: '',
  price: '',
  salePrice: '',
  stock: '10',
  sku: '',
  categoryId: '',
  images: '',
  featured: false,
  bestSeller: false,
  material: '100% Organic Cotton Yarn',
  careInstructions: 'Gentle hand wash in cold water. Lay flat to dry.',
  tags: '',
};

export default function AdminDashboard() {
  const { user, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'custom' | 'coupons'>('stats');
  const [mounted, setMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(MOCK_STATS);

  // Categories & Products state
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Product modal / form state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState(DEFAULT_PRODUCT_FORM);
  const [productStatus, setProductStatus] = useState<string | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Coupon form state
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minimumOrder: '0',
    usageLimit: '100',
    expiryDate: '',
  });
  const [couponStatus, setCouponStatus] = useState<string | null>(null);

  // Custom orders state
  const [customOrders, setCustomOrders] = useState<any[]>([]);

  // Sluggify helper
  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (titleVal: string) => {
    setProductForm(prev => ({
      ...prev,
      title: titleVal,
      slug: slugify(titleVal),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', files[0]);

    try {
      const response = await apiFetch('http://localhost:5000/api/v1/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok && data.success && data.url) {
        setProductForm(prev => {
          const currentImages = prev.images.trim();
          const separator = currentImages ? ', ' : '';
          return {
            ...prev,
            images: currentImages + separator + data.url,
          };
        });
      } else {
        alert(data.message || 'Image upload failed.');
      }
    } catch (err) {
      console.error('Error uploading image', err);
      alert('Could not connect to the image upload service.');
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    async function fetchDashboardData() {
      try {
        const response = await apiFetch('http://localhost:5000/api/v1/admin/dashboard');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setDashboardData(data.data);
          }
        }
      } catch (error) {
        console.warn('API offline, loading mock admin data.', error);
      }
    }

    async function fetchCustomOrders() {
      try {
        const response = await apiFetch('http://localhost:5000/api/v1/custom-orders/admin/all');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setCustomOrders(data.data);
          }
        }
      } catch {
        console.warn('Could not fetch custom orders.');
      }
    }

    fetchDashboardData();
    fetchCustomOrders();
  }, [user, accessToken]);

  // Load products and categories on tab switch
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    if (activeTab === 'products') {
      loadProductsAndCategories();
    }
  }, [activeTab, user]);

  const loadProductsAndCategories = async () => {
    setLoadingProducts(true);
    try {
      // Load products
      const prodRes = await fetch('http://localhost:5000/api/v1/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (prodData.success && Array.isArray(prodData.data)) {
          setProducts(prodData.data);
        }
      }

      // Load categories
      const catRes = await fetch('http://localhost:5000/api/v1/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.success && Array.isArray(catData.data)) {
          setCategories(catData.data);
          // Set default categoryId in form if empty
          if (catData.data.length > 0 && !productForm.categoryId) {
            setProductForm(prev => ({ ...prev, categoryId: catData.data[0].id }));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching admin products catalog.', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      ...DEFAULT_PRODUCT_FORM,
      categoryId: categories[0]?.id || '',
    });
    setProductStatus(null);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title || '',
      slug: prod.slug || '',
      description: prod.description || '',
      price: String(prod.price || ''),
      salePrice: prod.salePrice ? String(prod.salePrice) : '',
      stock: String(prod.stock ?? 10),
      sku: prod.sku || '',
      categoryId: prod.categoryId || categories[0]?.id || '',
      images: Array.isArray(prod.images) ? prod.images.join(', ') : '',
      featured: !!prod.featured,
      bestSeller: !!prod.bestSeller,
      material: prod.material || '100% Organic Cotton Yarn',
      careInstructions: prod.careInstructions || 'Gentle hand wash in cold water. Lay flat to dry.',
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : '',
    });
    setProductStatus(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setProductStatus(null);

    const imagesArray = productForm.images
      .split(',')
      .map(img => img.trim())
      .filter(Boolean);

    const tagsArray = productForm.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean);

    const payload = {
      title: productForm.title,
      slug: productForm.slug,
      description: productForm.description,
      price: parseFloat(productForm.price),
      salePrice: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
      stock: parseInt(productForm.stock),
      sku: productForm.sku,
      categoryId: productForm.categoryId,
      images: imagesArray.length > 0 ? imagesArray : ['/images/products/placeholder.jpg'],
      featured: productForm.featured,
      bestSeller: productForm.bestSeller,
      material: productForm.material,
      careInstructions: productForm.careInstructions,
      tags: tagsArray,
    };

    const isEdit = !!editingProduct;
    const url = isEdit
      ? `http://localhost:5000/api/v1/products/${editingProduct.id}`
      : 'http://localhost:5000/api/v1/products';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const response = await apiFetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setProductStatus(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
        setShowProductModal(false);
        loadProductsAndCategories();
      } else {
        setProductStatus(data.message || 'Operation failed.');
      }
    } catch {
      setProductStatus('Connection error.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate ${name}?`)) return;

    try {
      const response = await apiFetch(`http://localhost:5000/api/v1/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        alert('Product deactivated successfully.');
        loadProductsAndCategories();
      } else {
        alert('Failed to deactivate product.');
      }
    } catch {
      alert('Delete operation failed.');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponStatus(null);

    const payload = {
      code: couponForm.code.toUpperCase(),
      discountType: couponForm.discountType,
      discountValue: parseFloat(couponForm.discountValue),
      minimumOrder: parseFloat(couponForm.minimumOrder),
      usageLimit: parseInt(couponForm.usageLimit),
      expiryDate: new Date(couponForm.expiryDate).toISOString(),
    };

    try {
      const response = await apiFetch('http://localhost:5000/api/v1/coupons', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setCouponStatus('Coupon created successfully!');
        setCouponForm({
          code: '',
          discountType: 'PERCENTAGE',
          discountValue: '',
          minimumOrder: '0',
          usageLimit: '100',
          expiryDate: '',
        });
      } else {
        setCouponStatus(data.message || 'Failed to create coupon.');
      }
    } catch {
      setCouponStatus('Coupon service offline.');
    }
  };

  const handleUpdateCustomStatus = async (id: string, status: string, price: number, notes: string) => {
    try {
      const response = await apiFetch(`http://localhost:5000/api/v1/custom-orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, quotedPrice: price, adminNote: notes }),
      });
      if (response.ok) {
        alert('Custom order status updated successfully!');
        // Refresh custom orders
        const refreshResponse = await apiFetch('http://localhost:5000/api/v1/custom-orders/admin/all');
        const data = await refreshResponse.json();
        if (data.success) {
          setCustomOrders(data.data);
        }
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center min-h-[80vh]">
        <RefreshCw className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-on-surface-variant font-bold">Unspooling admin console...</p>
      </div>
    );
  }

  if (user?.role !== 'ADMIN') {
    return (
      <div className="bg-background min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white/70 backdrop-blur rounded-[2.5rem] p-8 border border-white/50 shadow-[0_8px_32px_rgba(224,64,160,0.1)] text-center space-y-6">
          <div className="w-20 h-20 bg-error-container/20 rounded-full flex items-center justify-center mx-auto text-error">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-headline text-on-surface">Access Denied</h2>
            <p className="text-sm text-on-surface-variant">You must be logged in as an administrator to access the dashboard controls.</p>
          </div>
          <Link href="/login" className="bg-primary hover:bg-[#c9328c] text-white font-bold py-3 px-8 rounded-full shadow-md transition-all inline-block hover:scale-[1.02] active:scale-95">
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts } = dashboardData;

  return (
    <div className="bg-background min-h-screen text-on-background pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white/50 backdrop-blur border border-white/50 p-6 rounded-[2.5rem] shadow-sm">
          <div>
            <h1 className="text-3xl font-black font-headline text-on-surface flex items-center gap-3">
              <span>Admin Control Panel</span>
              <span className="bg-tertiary/20 text-tertiary text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Secure Mode</span>
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">Manage product catalog, moderate custom requests, and oversee platform performance.</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex flex-wrap bg-surface-container p-1.5 rounded-2xl gap-1 border border-outline-variant/30">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'stats' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Stats & Health
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'products' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Manage Products
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'custom' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Custom Orders ({customOrders.length || stats.pendingCustomOrders})
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'coupons' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Create Coupon
            </button>
          </div>
        </div>

        {/* Tab 1: Stats & Health */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white/70 backdrop-blur p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Gross Revenue</span>
                <span className="text-3xl font-black text-primary mt-3">₹{stats.totalRevenue}</span>
              </div>
              <div className="bg-white/70 backdrop-blur p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Total Orders</span>
                <span className="text-3xl font-black text-on-surface mt-3">{stats.totalOrders}</span>
              </div>
              <div className="bg-white/70 backdrop-blur p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Yarn Catalog</span>
                <span className="text-3xl font-black text-secondary mt-3">{stats.totalProducts}</span>
              </div>
              <div className="bg-white/70 backdrop-blur p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Active Users</span>
                <span className="text-3xl font-black text-tertiary mt-3">{stats.totalUsers}</span>
              </div>
              <div className="bg-white/70 backdrop-blur p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-all">
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider">Custom Queued</span>
                <span className="text-3xl font-black text-error mt-3">{stats.pendingCustomOrders}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders */}
              <div className="bg-white/70 backdrop-blur p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-5">
                <h3 className="text-lg font-black font-headline text-on-surface flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  Recent Orders
                </h3>
                <div className="divide-y divide-outline-variant/30">
                  {recentOrders.map((o: any) => (
                    <div key={o.id} className="py-4 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-on-surface block text-base">{o.orderNumber}</span>
                        <span className="text-xs text-on-surface-variant block mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-primary text-base block">₹{o.total}</span>
                        <span className="text-[10px] inline-block font-bold text-secondary bg-secondary-container/20 px-2 py-0.5 rounded-full mt-1">{o.orderStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inventory Alerts */}
              <div className="bg-white/70 backdrop-blur p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-5">
                <h3 className="text-lg font-black font-headline text-on-surface flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Low Stock Inventory Alerts
                </h3>
                <div className="divide-y divide-outline-variant/30">
                  {lowStockProducts.map((p: any) => (
                    <div key={p.id} className="py-4 flex justify-between items-center text-sm">
                      <div>
                        <span className="font-bold text-on-surface block text-base">{p.title}</span>
                        <span className="text-[10px] text-on-surface-variant block mt-0.5">SKU: {p.sku}</span>
                      </div>
                      <span className="bg-error-container text-on-error-container text-xs font-bold px-3.5 py-1.5 rounded-full">
                        {p.stock} remaining
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manage Products */}
        {activeTab === 'products' && (
          <div className="bg-white/70 backdrop-blur p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <h3 className="text-xl font-black font-headline text-on-surface flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                Product Catalog Management
              </h3>
              <button
                onClick={handleOpenAddProduct}
                className="bg-primary hover:bg-[#c9328c] text-white text-xs font-bold py-3 px-5 rounded-full shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all w-fit"
              >
                <Plus className="w-4 h-4" />
                Add New Product
              </button>
            </div>

            {loadingProducts ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-on-surface-variant">Loading product list...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">
                No products found in database. Click Add Product above to register your first craft item.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-outline-variant/30">
                <table className="min-w-full divide-y divide-outline-variant/30 text-left text-sm">
                  <thead className="bg-surface-container text-on-surface-variant text-xs uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Product details</th>
                      <th className="px-6 py-4">SKU</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Stock</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 bg-white/40">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-surface-container/20 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-4">
                          <img
                            src={prod.images?.[0] || '/images/products/placeholder.jpg'}
                            alt={prod.title}
                            className="w-12 h-12 object-cover rounded-xl border border-outline-variant/30 bg-white"
                          />
                          <div>
                            <span className="font-bold text-on-surface block text-base leading-tight">{prod.title}</span>
                            <span className="text-xs text-on-surface-variant block mt-1">/{prod.slug}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-medium text-xs text-on-surface-variant">{prod.sku}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-secondary bg-secondary-container/20 px-2.5 py-1 rounded-full uppercase">
                            {prod.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-on-surface">
                          ₹{prod.salePrice || prod.price}
                          {prod.salePrice && (
                            <span className="text-[10px] text-on-surface-variant line-through block font-medium">₹{prod.price}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            prod.stock === 0
                              ? 'bg-error-container text-on-error-container'
                              : prod.stock <= 5
                              ? 'bg-warning-container text-on-warning-container'
                              : 'bg-primary-container/20 text-primary'
                          }`}>
                            {prod.stock} items
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="text-tertiary hover:bg-tertiary/10 p-2 rounded-full transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod.id, prod.title)}
                              className="text-error hover:bg-error/10 p-2 rounded-full transition-colors"
                              title="Deactivate product"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Custom Orders */}
        {activeTab === 'custom' && (
          <div className="bg-white/70 backdrop-blur p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-6 animate-fadeIn">
            <h3 className="text-xl font-black font-headline text-on-surface flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-primary" />
              Bespoke Custom Requests Moderation
            </h3>

            {customOrders.length === 0 ? (
              <p className="text-sm text-on-surface-variant py-8 text-center bg-surface-container/30 rounded-2xl border border-outline-variant/20">
                No custom orders found in the queue.
              </p>
            ) : (
              <div className="space-y-6 divide-y divide-outline-variant/30">
                {customOrders.map((order: any, idx: number) => (
                  <div key={order.id} className={`pt-6 ${idx === 0 ? 'pt-0' : ''} space-y-4`}>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-black text-on-surface text-lg">{order.description?.split(':')[0] || 'Custom Request'}</h4>
                        <p className="text-xs text-on-surface-variant mt-1">Submitted by <span className="font-bold text-on-surface">{order.name}</span> ({order.email})</p>
                      </div>
                      <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface bg-surface-container/40 p-4 rounded-2xl border border-outline-variant/20 leading-relaxed font-medium">
                      {order.description?.split(':').slice(1).join(':') || order.description}
                    </p>
                    
                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-on-surface uppercase tracking-wider">Quoted Price:</span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-bold">₹</span>
                            <input
                              type="number"
                              id={`price-${order.id}`}
                              defaultValue={order.quotedPrice || ''}
                              className="w-28 pl-6 pr-3 py-2 bg-surface-container border-0 text-xs rounded-full focus:ring-1 focus:ring-primary focus:outline-none font-bold"
                              placeholder="Price"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-on-surface uppercase tracking-wider">Admin Note:</span>
                          <input
                            type="text"
                            id={`notes-${order.id}`}
                            defaultValue={order.adminNote || ''}
                            className="w-64 px-4 py-2 bg-surface-container border-0 text-xs rounded-full focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/50"
                            placeholder="Enter notes..."
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const p = parseFloat((document.getElementById(`price-${order.id}`) as HTMLInputElement)?.value || '0');
                            const n = (document.getElementById(`notes-${order.id}`) as HTMLInputElement)?.value || '';
                            handleUpdateCustomStatus(order.id, 'QUOTED', p, n);
                          }}
                          className="bg-secondary hover:opacity-90 text-on-secondary text-xs font-bold px-5 py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
                        >
                          Submit Quote
                        </button>
                        <button
                          onClick={() => {
                            handleUpdateCustomStatus(order.id, 'CANCELLED', 0, 'Cancelled by admin.');
                          }}
                          className="bg-error-container text-on-error-container hover:opacity-90 text-xs font-bold px-5 py-2.5 rounded-full transition-all hover:scale-[1.02] active:scale-95"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Create Coupon */}
        {activeTab === 'coupons' && (
          <div className="max-w-xl bg-white/70 backdrop-blur p-8 rounded-[2rem] border border-white/50 shadow-sm space-y-6 animate-fadeIn">
            <h3 className="text-xl font-black font-headline text-on-surface flex items-center gap-2">
              <Tag className="w-5 h-5 text-secondary" />
              Configure New Coupon Code
            </h3>

            {couponStatus && (
              <div className="p-4 bg-primary-container/20 text-primary text-xs font-bold rounded-2xl text-center border border-primary/20">
                {couponStatus}
              </div>
            )}

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. YARNLOVE15"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full uppercase focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Discount Type</label>
                  <select
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none font-medium"
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (Rs.)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Discount Value</label>
                  <input
                    type="number"
                    placeholder="15"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    placeholder="500"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40"
                    value={couponForm.minimumOrder}
                    onChange={(e) => setCouponForm({ ...couponForm, minimumOrder: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Max Usages</label>
                  <input
                    type="number"
                    placeholder="100"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-on-surface-variant/40"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none text-on-surface-variant"
                  value={couponForm.expiryDate}
                  onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="w-full bg-primary hover:bg-[#c9328c] text-white py-3 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(224,64,160,0.2)] hover:scale-[1.02] active:scale-95 transition-all mt-2">
                <Plus className="w-4 h-4" />
                <span>Create Coupon</span>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Add/Edit Product Modal Overlay */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-on-background/30 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-[2.5rem] p-8 border border-outline-variant/30 shadow-[0_16px_48px_rgba(124,82,170,0.2)] space-y-6 relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-2xl font-black font-headline text-on-surface">
                {editingProduct ? 'Edit Product details' : 'Add New Product'}
              </h3>
              <p className="text-xs text-on-surface-variant">Fill out the form below to register the custom handcrafted product details.</p>
            </div>

            {productStatus && (
              <div className="p-4 bg-primary-container/20 text-primary text-xs font-bold rounded-2xl text-center border border-primary/20">
                {productStatus}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Product Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Sweetie the Bunny"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                    value={productForm.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Slug (URL Route)</label>
                  <input
                    type="text"
                    placeholder="e.g. sweetie-the-bunny"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none text-on-surface-variant/80 font-mono"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: slugify(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">SKU identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. PLUSH-BUNNY-01"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Category</label>
                  <select
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none font-bold text-on-surface"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Stock quantity</label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Description</label>
                <textarea
                  placeholder="Enter detailed description of the handmade craft..."
                  className="w-full bg-surface-container border-0 text-sm px-5 py-3.5 rounded-3xl focus:ring-1 focus:ring-primary focus:outline-none h-24 resize-none"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Base Price (₹)</label>
                  <input
                    type="number"
                    placeholder="1299"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Sale Price (₹, Optional)</label>
                  <input
                    type="number"
                    placeholder="1099"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                    value={productForm.salePrice}
                    onChange={(e) => setProductForm({ ...productForm, salePrice: e.target.value })}
                  />
                </div>
              </div>

              {(() => {
                const currentImagesArray = productForm.images
                  ? productForm.images.split(',').map((img: string) => img.trim()).filter(Boolean)
                  : [];
                return (
                  <div>
                    <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Product Images</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="e.g. /images/products/bunny-1.jpg, /images/products/bunny-2.jpg"
                        className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                        value={productForm.images}
                        onChange={(e) => setProductForm({ ...productForm, images: e.target.value })}
                      />
                      
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 px-5 py-2.5 bg-secondary hover:opacity-90 text-on-secondary text-xs font-bold rounded-full cursor-pointer transition-all hover:scale-[1.02] active:scale-95 shadow-sm">
                          {uploadingImage ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>Upload Image from System</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                        </label>
                        <span className="text-[10px] text-on-surface-variant font-medium">PNG, JPG, WEBP, GIF up to 5MB</span>
                      </div>

                      {currentImagesArray.length > 0 && (
                        <div className="bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20 space-y-2">
                          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-wider block">Uploaded Images Preview (Hover to Delete)</span>
                          <div className="flex flex-wrap gap-3">
                            {currentImagesArray.map((imgUrl, idx) => (
                              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-outline-variant group shadow-sm bg-white">
                                <img src={imgUrl} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = currentImagesArray.filter((_, i) => i !== idx).join(', ');
                                    setProductForm({ ...productForm, images: updated });
                                  }}
                                  className="absolute inset-0 bg-error/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                  title="Delete image"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Material Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 100% Organic Cotton Yarn"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Product Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. bunny, plushie, toy"
                    className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Care Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Gentle hand wash in cold water."
                  className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-1 focus:ring-primary focus:outline-none"
                  value={productForm.careInstructions}
                  onChange={(e) => setProductForm({ ...productForm, careInstructions: e.target.value })}
                />
              </div>

              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-primary border-outline-variant focus:ring-primary rounded"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                  />
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Featured item</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-primary border-outline-variant focus:ring-primary rounded"
                    checked={productForm.bestSeller}
                    onChange={(e) => setProductForm({ ...productForm, bestSeller: e.target.checked })}
                  />
                  <span className="text-xs font-bold text-on-surface uppercase tracking-wider">Best Seller</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingProduct}
                className="w-full bg-primary hover:bg-[#c9328c] text-white py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(224,64,160,0.2)] hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                {savingProduct ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Product...</span>
                  </>
                ) : (
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
