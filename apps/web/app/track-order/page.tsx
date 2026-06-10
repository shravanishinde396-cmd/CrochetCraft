'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiFetch, API_BASE } from '../utils/apiFetch';
import {
  MapPin,
  Truck,
  Package,
  Compass,
  Navigation,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Map,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

interface Address {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

interface StatusHistory {
  id: string;
  status: string;
  note: string;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  statusHistory: StatusHistory[];
}

export default function TrackOrderPage() {
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Geolocation states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  // Animation progress for simulated delivery truck
  const [truckProgress, setTruckProgress] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Truck movement animation when order is shipped or out for delivery
  useEffect(() => {
    if (!selectedOrder) return;
    
    // Reset progress
    setTruckProgress(0);

    const status = selectedOrder.orderStatus;
    if (status === 'PENDING' || status === 'CONFIRMED') {
      setTruckProgress(10);
    } else if (status === 'PACKED') {
      setTruckProgress(30);
    } else if (status === 'SHIPPED') {
      // Animate between 40% and 75%
      const interval = setInterval(() => {
        setTruckProgress((prev) => {
          if (prev >= 75) return 40;
          return prev + 1;
        });
      }, 150);
      return () => clearInterval(interval);
    } else if (status === 'OUT_FOR_DELIVERY') {
      // Animate between 80% and 95%
      const interval = setInterval(() => {
        setTruckProgress((prev) => {
          if (prev >= 95) return 80;
          return prev + 1.5;
        });
      }, 100);
      return () => clearInterval(interval);
    } else if (status === 'DELIVERED') {
      setTruckProgress(100);
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/api/v1/orders?limit=50`);
      const data = await res.json();
      if (res.ok && data.success) {
        const fetchedOrders = data.data || [];
        setOrders(fetchedOrders);
        if (fetchedOrders.length > 0) {
          setSelectedOrder(fetchedOrders[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get user's live browser location
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        setLocating(false);

        // CrochetCraft Warehouse: Bangalore (12.9716, 77.5946)
        const warehouseLat = 12.9716;
        const warehouseLng = 77.5946;
        const calcDist = calculateDistance(warehouseLat, warehouseLng, lat, lng);
        setDistance(calcDist);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Could not access location. Please check browser permissions.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Haversine formula to calculate distance in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1));
  };

  const getStatusSteps = (currentStatus: string) => {
    const steps = [
      { key: 'PENDING', label: 'Ordered', icon: Package },
      { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2 },
      { key: 'SHIPPED', label: 'Shipped', icon: Truck },
      { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Compass },
      { key: 'DELIVERED', label: 'Delivered', icon: MapPin },
    ];

    // Map orderStatus to step indexes
    const statusMap: Record<string, number> = {
      PENDING: 0,
      CONFIRMED: 1,
      PACKED: 1,
      SHIPPED: 2,
      OUT_FOR_DELIVERY: 3,
      DELIVERED: 4,
    };

    const activeIndex = statusMap[currentStatus] ?? -1;

    return steps.map((step, idx) => {
      const isCompleted = idx <= activeIndex;
      const isActive = idx === activeIndex;
      return { ...step, isCompleted, isActive };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fef7ff]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E07A5F]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-orange-50 shadow-sm text-center space-y-6">
        <div className="inline-flex p-4 bg-orange-50 rounded-full text-[#E07A5F]">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-[#3D405B]">Access Denied</h2>
        <p className="text-gray-600">Please log in to your account to view and track your orders.</p>
        <Link href="/login" className="w-full inline-block bg-[#E07A5F] text-white py-3 rounded-full font-bold transition-opacity hover:opacity-90">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="mb-8 pt-16">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#3D405B] leading-[1.15]">
          Track Your <span className="text-gradient">Orders</span>
        </h1>
        <p className="text-gray-600 mt-2">View real-time delivery status and live location updates for your purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-orange-50/50 shadow-sm text-center max-w-lg mx-auto space-y-4">
          <Truck className="w-16 h-16 text-[#81B29A] mx-auto animate-bounce" />
          <h3 className="text-xl font-bold text-[#3D405B]">No Orders Yet</h3>
          <p className="text-gray-600">You haven&apos;t placed any orders yet. Visit our shop to find beautiful handmade crochet creations!</p>
          <Link href="/products" className="inline-block bg-[#E07A5F] text-white px-8 py-3 rounded-full font-bold hover:opacity-90">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Order list (Left sidebar) */}
          <div className="lg:col-span-1 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <h3 className="font-bold text-lg text-[#3D405B] mb-2 px-1">Order History</h3>
            {orders.map((o) => {
              const isSelected = selectedOrder?.id === o.id;
              return (
                <div
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#E07A5F] shadow-md scale-[1.01]'
                      : 'bg-white/50 border-orange-50/50 hover:bg-white hover:border-orange-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-500 font-bold uppercase">Order No.</p>
                      <h4 className="font-extrabold text-[#3D405B]">{o.orderNumber}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${
                        o.orderStatus === 'DELIVERED'
                          ? 'bg-green-100 text-green-700'
                          : o.orderStatus === 'CANCELLED' || o.orderStatus === 'REFUNDED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-orange-100 text-[#E07A5F]'
                      }`}
                    >
                      {o.orderStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <p className="font-bold text-[#3D405B]">₹{o.total.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracking Details (Right side) */}
          <div className="lg:col-span-2 space-y-6">
            {selectedOrder && (
              <>
                {/* Status overview */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-orange-50/50 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-orange-50">
                    <div>
                      <h2 className="text-xl font-extrabold text-[#3D405B]">Tracking: {selectedOrder.orderNumber}</h2>
                      <p className="text-xs text-gray-500 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-right text-gray-500 font-bold">Total Order Value</p>
                      <p className="text-2xl font-black text-[#E07A5F]">₹{selectedOrder.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Cancelled/Refunded Exception banner */}
                  {(selectedOrder.orderStatus === 'CANCELLED' || selectedOrder.orderStatus === 'REFUNDED') ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 text-red-700">
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold text-sm">Order Status: {selectedOrder.orderStatus}</h4>
                        <p className="text-xs mt-1">
                          This order was {selectedOrder.orderStatus.toLowerCase()}. If you have any inquiries regarding refunds, please contact support.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Progress steps tracker */
                    <div className="relative pt-4">
                      {/* Line connector */}
                      <div className="absolute top-[38px] left-[24px] right-[24px] h-1 bg-gray-100 -z-10 hidden md:block">
                        <div
                          className="h-full bg-[#81B29A] transition-all duration-500"
                          style={{
                            width: `${
                              selectedOrder.orderStatus === 'PENDING'
                                ? '0%'
                                : selectedOrder.orderStatus === 'CONFIRMED' || selectedOrder.orderStatus === 'PACKED'
                                ? '25%'
                                : selectedOrder.orderStatus === 'SHIPPED'
                                ? '50%'
                                : selectedOrder.orderStatus === 'OUT_FOR_DELIVERY'
                                ? '75%'
                                : '100%'
                            }`,
                          }}
                        />
                      </div>

                      <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-2">
                        {getStatusSteps(selectedOrder.orderStatus).map((step, idx) => {
                          const StepIcon = step.icon;
                          return (
                            <div key={idx} className="flex md:flex-col items-center md:text-center space-x-4 md:space-x-0 md:space-y-2 flex-1">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                                  step.isCompleted
                                    ? 'bg-[#81B29A] text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-400'
                                } ${step.isActive ? 'ring-4 ring-green-100 scale-105' : ''}`}
                              >
                                <StepIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className={`font-bold text-sm ${step.isCompleted ? 'text-[#3D405B]' : 'text-gray-400'}`}>
                                  {step.label}
                                </h4>
                                {step.isActive && (
                                  <p className="text-[10px] text-[#81B29A] font-extrabold uppercase animate-pulse">Active Status</p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Status Notes */}
                  {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                    <div className="bg-[#fef7ff] p-4 rounded-xl space-y-2">
                      <h4 className="text-xs font-black text-[#3D405B] uppercase tracking-wider">Milestone History</h4>
                      <div className="space-y-3 mt-2">
                        {selectedOrder.statusHistory.map((history, hIdx) => (
                          <div key={hIdx} className="flex justify-between items-start text-xs border-l-2 border-[#E07A5F]/30 pl-3">
                            <div>
                              <p className="font-bold text-[#3D405B]">{history.status.replace(/_/g, ' ')}</p>
                              <p className="text-gray-500 mt-0.5">{history.note}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                              {new Date(history.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Simulated Delivery Map & Live Geolocation */}
                {!(selectedOrder.orderStatus === 'CANCELLED' || selectedOrder.orderStatus === 'REFUNDED') && (
                  <div className="bg-white p-6 md:p-8 rounded-2xl border border-orange-50/50 shadow-sm space-y-6">
                    <div className="flex justify-between items-center pb-2 border-b border-orange-50">
                      <div className="flex items-center space-x-2">
                        <Map className="w-5 h-5 text-[#E07A5F]" />
                        <h3 className="font-bold text-lg text-[#3D405B]">Live Delivery Location</h3>
                      </div>
                      <button
                        onClick={handleGetLocation}
                        disabled={locating}
                        className="inline-flex items-center space-x-1.5 bg-orange-50 text-[#E07A5F] hover:bg-orange-100 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                      >
                        <Navigation className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                        <span>{locating ? 'Locating...' : 'Show My Location'}</span>
                      </button>
                    </div>

                    {/* Geolocation feedback */}
                    {locationError && (
                      <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{locationError}</p>
                    )}

                    {userLocation && (
                      <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between text-[#81B29A] text-xs font-semibold">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          <span>Connected! Your device is at Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)}</span>
                        </div>
                        {distance !== null && (
                          <span className="bg-[#81B29A] text-white px-2.5 py-1 rounded-full font-black ml-2 whitespace-nowrap">
                            {distance} km away
                          </span>
                        )}
                      </div>
                    )}

                    {/* Simulated SVG Route map */}
                    <div className="relative w-full h-48 bg-orange-50/30 rounded-xl overflow-hidden border border-orange-100 flex items-center justify-center p-4">
                      {/* Dotted path */}
                      <svg className="w-full h-full" viewBox="0 0 600 150">
                        <defs>
                          <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#E07A5F" />
                            <stop offset="100%" stopColor="#81B29A" />
                          </linearGradient>
                        </defs>
                        
                        <path
                          d="M 50 75 Q 175 25, 300 75 T 550 75"
                          fill="transparent"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                        
                        <path
                          id="delivery-path"
                          d="M 50 75 Q 175 25, 300 75 T 550 75"
                          fill="transparent"
                          stroke="url(#routeGrad)"
                          strokeWidth="4"
                          strokeDasharray="8 6"
                          strokeLinecap="round"
                        />

                        {/* Origin Node */}
                        <circle cx="50" cy="75" r="8" fill="#E07A5F" />
                        <text x="35" y="105" fill="#3D405B" className="text-[10px] font-black uppercase font-sans">Warehouse</text>
                        <text x="35" y="120" fill="#9ca3af" className="text-[8px] font-sans">Bangalore</text>

                        {/* Destination Node */}
                        <circle cx="550" cy="75" r="8" fill="#81B29A" />
                        <text x="490" y="105" fill="#3D405B" className="text-[10px] font-black uppercase text-right font-sans">Destination</text>
                        <text x="490" y="120" fill="#9ca3af" className="text-[8px] text-right font-sans">
                          {selectedOrder.address.city}, {selectedOrder.address.state}
                        </text>

                        {/* Pulsing Destination */}
                        <circle cx="550" cy="75" r="16" fill="none" stroke="#81B29A" strokeWidth="2" className="animate-ping opacity-35" />

                        {/* Delivery truck icon moving along the path */}
                        <g transform={`translate(${40 + truckProgress * 5}, ${75 - Math.sin((truckProgress / 100) * Math.PI * 2) * 25})`}>
                          <rect x="-18" y="-12" width="30" height="18" rx="3" fill="#3D405B" />
                          <rect x="6" y="-8" width="8" height="12" rx="2" fill="#E07A5F" />
                          <circle cx="-10" cy="8" r="4" fill="#111" />
                          <circle cx="6" cy="8" r="4" fill="#111" />
                        </g>
                      </svg>

                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-orange-100 text-[10px] font-black text-[#3D405B]">
                        STATUS: {selectedOrder.orderStatus.replace(/_/g, ' ')}
                      </div>

                      {truckProgress > 0 && truckProgress < 100 && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm px-4 py-1 rounded-full border border-orange-100 text-xs font-bold text-gray-600 animate-pulse">
                          In Transit ({Math.round(truckProgress)}% Dispatched)
                        </div>
                      )}
                    </div>

                    {/* Delivery Partner Details */}
                    {selectedOrder.courierName && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50/20 p-4 rounded-xl border border-orange-50 text-xs">
                        <div>
                          <p className="text-gray-400 font-bold uppercase">Courier Partner</p>
                          <p className="font-extrabold text-[#3D405B] mt-0.5">{selectedOrder.courierName}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 font-bold uppercase">Tracking Number</p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="font-extrabold text-[#3D405B]">{selectedOrder.trackingNumber}</span>
                            {selectedOrder.trackingUrl && (
                              <a
                                href={selectedOrder.trackingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#E07A5F] hover:text-[#81B29A] transition-colors"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Order Summary & Delivery Address */}
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-orange-50/50 shadow-sm space-y-6">
                  <h3 className="font-bold text-lg text-[#3D405B]">Order Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Shipping Address */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-[#3D405B] uppercase tracking-wider">Shipping Destination</h4>
                      <div className="p-4 bg-orange-50/20 rounded-xl border border-orange-50 text-xs text-gray-600 space-y-1">
                        <p className="font-extrabold text-[#3D405B]">{selectedOrder.address.fullName}</p>
                        <p>{selectedOrder.address.line1}</p>
                        {selectedOrder.address.line2 && <p>{selectedOrder.address.line2}</p>}
                        <p>
                          {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                        </p>
                        <p>{selectedOrder.address.country}</p>
                        <p className="pt-2 font-semibold text-[#3D405B]">Phone: {selectedOrder.address.phone}</p>
                      </div>
                    </div>

                    {/* Order Items Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-[#3D405B] uppercase tracking-wider">Items Summary</h4>
                      <div className="space-y-3">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="flex items-center space-x-3 text-xs">
                            <div className="relative w-10 h-10 bg-orange-50 rounded-lg overflow-hidden border border-orange-100 flex-shrink-0">
                              <img
                                src={item.image.startsWith('http') ? item.image : `${API_BASE}${item.image}`}
                                alt={item.title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-[#3D405B] truncate">{item.title}</p>
                              <p className="text-gray-400">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <span className="font-bold text-[#3D405B] ml-2">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
