'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegister ? 'register' : 'login';
    const payload = isRegister
      ? { name: formData.name, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await fetch(`http://localhost:5000/api/v1/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setAuth(data.data.user, data.data.accessToken);
        router.push('/');
      } else {
        if (data.errors && data.errors.length > 0) {
          const errorMsg = data.errors.map((err: { message: string }) => err.message).join(', ');
          setError(errorMsg);
        } else {
          setError(data.message || 'Authentication failed. Please verify credentials.');
        }
      }
    } catch {
      setError('Cannot connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/70 backdrop-blur rounded-[2.5rem] p-8 border border-white/50 shadow-[0_8px_32px_rgba(224,64,160,0.1)] space-y-6">
        
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-primary-container/20 text-primary px-4 py-1.5 rounded-full text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Premium Handcrafted Community</span>
          </div>
          <h2 className="text-3xl font-black font-headline text-on-surface">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {isRegister
              ? 'Join us to track orders, save wishlists, and order custom yarn slots.'
              : 'Login to access your premium shopping experience.'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-error-container text-on-error-container text-xs font-bold rounded-2xl text-center border border-error/20">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Jane Doe"
                className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/60 text-on-background shadow-inner"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="jane@example.com"
              className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/60 text-on-background shadow-inner"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-on-surface uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full bg-surface-container border-0 text-sm px-5 py-3 rounded-full focus:ring-2 focus:ring-primary placeholder:text-on-surface-variant/60 text-on-background shadow-inner"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#c9328c] text-white font-bold py-3 px-6 rounded-full shadow-[0_4px_16px_rgba(224,64,160,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{isRegister ? 'Register' : 'Login'}</span>
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-secondary hover:underline font-bold"
          >
            {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
          </button>
        </div>

        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-outline-variant/30"></div></div>
          <span className="relative bg-[#fef7ff] px-4 text-[10px] uppercase font-black text-on-surface-variant/60 tracking-wider">or continue with</span>
        </div>

        <button
          onClick={() => {
            setAuth({
              id: 'google-user-id',
              name: 'Jane Smith',
              email: 'janesmith@gmail.com',
              role: 'CUSTOMER',
            }, 'mock-google-access-token');
            router.push('/');
          }}
          className="w-full flex items-center justify-center space-x-2 border border-outline-variant hover:bg-surface-container py-3 rounded-full text-xs font-bold text-on-surface transition-all shadow-sm hover:scale-[1.01]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Google Account</span>
        </button>
      </div>
    </div>
  );
}
