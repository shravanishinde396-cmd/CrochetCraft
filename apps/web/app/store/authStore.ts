'use client';

import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPERADMIN';
  phone?: string | null;
  avatar?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if we are running in the browser and load initial state
  const isBrowser = typeof window !== 'undefined';
  const savedUser = isBrowser ? localStorage.getItem('user') : null;
  const savedToken = isBrowser ? localStorage.getItem('accessToken') : null;

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    accessToken: savedToken,
    isAuthenticated: !!savedToken,
    setAuth: (user, accessToken) => {
      if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
      }
      set({ user, accessToken, isAuthenticated: true });
    },
    logout: () => {
      if (isBrowser) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
      set({ user: null, accessToken: null, isAuthenticated: false });
    },
  };
});
