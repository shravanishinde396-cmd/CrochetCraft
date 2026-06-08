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
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Check if we are running in the browser and load initial state
  const isBrowser = typeof window !== 'undefined';
  const savedUser = isBrowser ? localStorage.getItem('user') : null;
  const savedToken = isBrowser ? localStorage.getItem('accessToken') : null;
  const savedRefreshToken = isBrowser ? localStorage.getItem('refreshToken') : null;

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    accessToken: savedToken,
    refreshToken: savedRefreshToken,
    isAuthenticated: !!savedToken,
    setAuth: (user, accessToken, refreshToken) => {
      if (isBrowser) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
      }
      set({
        user,
        accessToken,
        refreshToken: refreshToken || (isBrowser ? localStorage.getItem('refreshToken') : null),
        isAuthenticated: true,
      });
    },
    setTokens: (accessToken, refreshToken) => {
      if (isBrowser) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
      }
      set({ accessToken, refreshToken });
    },
    logout: () => {
      if (isBrowser) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
  };
});
