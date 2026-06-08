'use client';

import { create } from 'zustand';

export interface CartProduct {
  id: string;
  title: string;
  slug: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  stock: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

interface Coupon {
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT' | 'FIRST_PURCHASE' | 'CATEGORY';
  discountValue: number;
}

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
  calculateTotals: () => void;
}

export const useCartStore = create<CartState>((set, get) => {
  const isBrowser = typeof window !== 'undefined';
  const savedItems = isBrowser ? localStorage.getItem('cartItems') : null;

  const getInitialItems = (): CartItem[] => {
    try {
      return savedItems ? JSON.parse(savedItems) : [];
    } catch {
      return [];
    }
  };

  return {
    items: getInitialItems(),
    coupon: null,
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,

    addItem: (product, quantity = 1) => {
      const items = get().items;
      const existingItem = items.find((i) => i.product.id === product.id);
      let newItems;

      if (existingItem) {
        newItems = items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(product.stock, i.quantity + quantity) }
            : i
        );
      } else {
        newItems = [...items, { product, quantity: Math.min(product.stock, quantity) }];
      }

      if (isBrowser) {
        localStorage.setItem('cartItems', JSON.stringify(newItems));
      }
      set({ items: newItems });
      get().calculateTotals();
    },

    removeItem: (productId) => {
      const items = get().items;
      const newItems = items.filter((i) => i.product.id !== productId);
      if (isBrowser) {
        localStorage.setItem('cartItems', JSON.stringify(newItems));
      }
      set({ items: newItems });
      get().calculateTotals();
    },

    updateQuantity: (productId, quantity) => {
      const items = get().items;
      const newItems = items.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.max(1, Math.min(i.product.stock, quantity)) }
          : i
      );
      if (isBrowser) {
        localStorage.setItem('cartItems', JSON.stringify(newItems));
      }
      set({ items: newItems });
      get().calculateTotals();
    },

    clearCart: () => {
      if (isBrowser) {
        localStorage.removeItem('cartItems');
      }
      set({ items: [], coupon: null, subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 });
    },

    applyCoupon: (coupon) => {
      set({ coupon });
      get().calculateTotals();
    },

    removeCoupon: () => {
      set({ coupon: null });
      get().calculateTotals();
    },

    calculateTotals: () => {
      const { items, coupon } = get();
      const subtotal = items.reduce((sum, item) => {
        const price = item.product.salePrice || item.product.price;
        return sum + price * item.quantity;
      }, 0);

      let discount = 0;
      if (coupon) {
        if (coupon.discountType === 'PERCENTAGE') {
          discount = (subtotal * coupon.discountValue) / 100;
        } else {
          discount = coupon.discountValue;
        }
      }

      const shipping = subtotal === 0 ? 0 : subtotal >= 1000 ? 0 : 80;
      const tax = parseFloat(((subtotal - discount) * 0.18).toFixed(2));
      const total = Math.max(0, subtotal - discount + tax + shipping);

      set({ subtotal, discount, shipping, tax, total });
    },
  };
});
