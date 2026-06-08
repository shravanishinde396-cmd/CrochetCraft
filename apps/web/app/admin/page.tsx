'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert, BarChart3, Package, HeartHandshake, Tag, Plus } from 'lucide-react';

// Premium mock admin dashboard stats in case API offline
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

export default function AdminDashboard() {
  const { user, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'custom' | 'coupons'>('stats');
  const [dashboardData, setDashboardData] = useState<any>(MOCK_STATS);

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

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    async function fetchDashboardData() {
      try {
        const response = await fetch('http://localhost:5000/api/v1/admin/dashboard', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
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
        const response = await fetch('http://localhost:5000/api/v1/custom-orders/admin/all', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
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
      const response = await fetch('http://localhost:5000/api/v1/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
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
      const response = await fetch(`http://localhost:5000/api/v1/custom-orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status, quotedPrice: price, adminNote: notes }),
      });
      if (response.ok) {
        alert('Custom order status updated successfully!');
        // Refresh custom orders
        const refreshResponse = await fetch('http://localhost:5000/api/v1/custom-orders/admin/all', {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });
        const data = await refreshResponse.json();
        if (data.success) {
          setCustomOrders(data.data);
        }
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-md mx-auto text-center py-24 px-6 space-y-6">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-500">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#3D405B]">Access Denied</h2>
          <p className="text-sm text-gray-500">You must be logged in as an administrator to access the dashboard controls.</p>
        </div>
        <Link href="/login" className="btn-primary inline-block px-8 py-3 rounded-full text-base font-bold shadow-md">
          Login as Admin
        </Link>
      </div>
    );
  }

  const { stats, recentOrders, lowStockProducts } = dashboardData;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-orange-100 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3D405B] flex items-center gap-2">
            <span>Admin Control Panel</span>
            <span className="bg-[#81B29A] text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold">Secure</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage product catalog, moderate custom requests, and oversee platform performance.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-orange-50/50 p-1.5 rounded-xl border border-orange-100/50">
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'stats' ? 'bg-[#E07A5F] text-white shadow-sm' : 'text-gray-600 hover:text-[#E07A5F]'
            }`}
          >
            Stats & Health
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'custom' ? 'bg-[#E07A5F] text-white shadow-sm' : 'text-gray-600 hover:text-[#E07A5F]'
            }`}
          >
            Custom Orders ({customOrders.length || stats.pendingCustomOrders})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'coupons' ? 'bg-[#E07A5F] text-white shadow-sm' : 'text-gray-600 hover:text-[#E07A5F]'
            }`}
          >
            Create Coupon
          </button>
        </div>
      </div>

      {/* Main Tab Panel Display */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-orange-50/50 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Gross Revenue</span>
              <span className="text-2xl font-black text-[#E07A5F] mt-2">Rs. {stats.totalRevenue}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-50/50 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Total Orders</span>
              <span className="text-2xl font-black text-[#3D405B] mt-2">{stats.totalOrders}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-50/50 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Yarn Catalog</span>
              <span className="text-2xl font-black text-[#81B29A] mt-2">{stats.totalProducts}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-50/50 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Active Users</span>
              <span className="text-2xl font-black text-[#F2CC8F] mt-2">{stats.totalUsers}</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-orange-50/50 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Custom Queued</span>
              <span className="text-2xl font-black text-red-500 mt-2">{stats.pendingCustomOrders}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-2xl border border-orange-50/50 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#3D405B] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#81B29A]" />
                Recent Orders
              </h3>
              <div className="divide-y divide-orange-50/50">
                {recentOrders.map((o: any) => (
                  <div key={o.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-[#3D405B]">{o.orderNumber}</span>
                      <span className="text-xs text-gray-400 block mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#E07A5F]">Rs. {o.total}</span>
                      <span className="text-[10px] block font-bold text-green-600 mt-0.5">{o.orderStatus}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory Alerts */}
            <div className="bg-white p-6 rounded-2xl border border-orange-50/50 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#3D405B] flex items-center gap-2">
                <Package className="w-4 h-4 text-[#E07A5F]" />
                Low Stock Inventory Alerts
              </h3>
              <div className="divide-y divide-orange-50/50">
                {lowStockProducts.map((p: any) => (
                  <div key={p.id} className="py-3 flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-[#3D405B]">{p.title}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">SKU: {p.sku}</span>
                    </div>
                    <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full">
                      {p.stock} remaining
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'custom' && (
        <div className="bg-white p-6 rounded-2xl border border-orange-50/50 shadow-sm space-y-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-[#3D405B] flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-[#E07A5F]" />
            Bespoke Custom Requests Moderation
          </h3>

          {customOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No custom orders found in the queue.</p>
          ) : (
            <div className="space-y-6 divide-y divide-orange-50/50">
              {customOrders.map((order: any, idx: number) => (
                <div key={order.id} className={`pt-4 ${idx === 0 ? 'pt-0' : ''} space-y-3`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#3D405B] text-base">{order.description.split(':')[0] || 'Custom Request'}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">Submitted by {order.name} ({order.email})</p>
                    </div>
                    <span className="bg-orange-50 text-[#E07A5F] text-xs font-bold px-3 py-1 rounded-full uppercase">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed bg-orange-50/30 p-3.5 rounded-lg border border-orange-50">
                    {order.description.split(':').slice(1).join(':') || order.description}
                  </p>
                  
                  {/* Action Bar */}
                  <div className="flex flex-wrap gap-4 items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-[#3D405B]">Quoted Price (Rs.):</span>
                      <input
                        type="number"
                        id={`price-${order.id}`}
                        defaultValue={order.quotedPrice || ''}
                        className="w-24 bg-orange-50/30 border-0 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                        placeholder="Price"
                      />
                      <span className="text-xs font-bold text-[#3D405B] ml-2">Admin Note:</span>
                      <input
                        type="text"
                        id={`notes-${order.id}`}
                        defaultValue={order.adminNote || ''}
                        className="w-48 bg-orange-50/30 border-0 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none"
                        placeholder="Notes"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const p = parseFloat((document.getElementById(`price-${order.id}`) as HTMLInputElement)?.value || '0');
                          const n = (document.getElementById(`notes-${order.id}`) as HTMLInputElement)?.value || '';
                          handleUpdateCustomStatus(order.id, 'QUOTED', p, n);
                        }}
                        className="bg-[#81B29A] hover:bg-[#72a38b] text-white text-xs font-bold px-4.5 py-2 rounded-lg transition-colors"
                      >
                        Submit Quote
                      </button>
                      <button
                        onClick={() => {
                          handleUpdateCustomStatus(order.id, 'CANCELLED', 0, 'Cancelled by admin.');
                        }}
                        className="bg-red-50 text-red-500 hover:bg-red-100 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
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

      {activeTab === 'coupons' && (
        <div className="max-w-xl bg-white p-6 rounded-2xl border border-orange-50/50 shadow-sm space-y-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-[#3D405B] flex items-center gap-2">
            <Tag className="w-5 h-5 text-[#81B29A]" />
            Configure New Coupon Code
          </h3>

          {couponStatus && (
            <div className="p-3 bg-orange-50 text-[#E07A5F] text-xs font-bold rounded-xl text-center">
              {couponStatus}
            </div>
          )}

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[#3D405B] uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. YARNLOVE15"
                  className="w-full bg-orange-50/30 border-0 text-sm px-4 py-2.5 rounded-xl uppercase focus:outline-none"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#3D405B] uppercase mb-1">Discount Type</label>
                <select
                  className="w-full bg-orange-50/30 border-0 text-sm px-4 py-2.5 rounded-xl focus:outline-none"
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
                <label className="block text-[10px] font-bold text-[#3D405B] uppercase mb-1">Discount Value</label>
                <input
                  type="number"
                  placeholder="15"
                  className="w-full bg-orange-50/30 border-0 text-sm px-4 py-2.5 rounded-xl focus:outline-none"
                  value={couponForm.discountValue}
                  onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#3D405B] uppercase mb-1">Min Order (Rs.)</label>
                <input
                  type="number"
                  placeholder="500"
                  className="w-full bg-orange-50/30 border-0 text-sm px-4 py-2.5 rounded-xl focus:outline-none"
                  value={couponForm.minimumOrder}
                  onChange={(e) => setCouponForm({ ...couponForm, minimumOrder: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#3D405B] uppercase mb-1">Max Usages</label>
                <input
                  type="number"
                  placeholder="100"
                  className="w-full bg-orange-50/30 border-0 text-sm px-4 py-2.5 rounded-xl focus:outline-none"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#3D405B] uppercase mb-1">Expiry Date</label>
              <input
                type="date"
                className="w-full bg-orange-50/30 border-0 text-sm px-4 py-2.5 rounded-xl focus:outline-none"
                value={couponForm.expiryDate}
                onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="w-full btn-primary py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-1.5 shadow-md">
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
