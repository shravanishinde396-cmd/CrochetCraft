'use client';

import { useAuthStore } from '../store/authStore';

const API_BASE = 'http://localhost:5000';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.success && data.data?.accessToken) {
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      useAuthStore.getState().setTokens(accessToken, newRefreshToken);
      return accessToken;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * A drop-in replacement for `fetch` that:
 * 1. Automatically attaches the Authorization header
 * 2. On a 401 response, silently refreshes the access token and retries once
 * 3. If refresh fails, logs the user out
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const { accessToken } = useAuthStore.getState();

  // Merge auth header (skip if body is FormData — browser sets Content-Type automatically)
  const headers: Record<string, string> = {};
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  };

  let response = await fetch(url, mergedOptions);

  // If 401 and we have a refresh token, attempt silent refresh
  if (response.status === 401) {
    // Deduplicate concurrent refresh attempts
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const newToken = await (refreshPromise || refreshAccessToken());

    if (newToken) {
      // Retry the original request with the new token
      const retryHeaders = {
        ...mergedOptions.headers as Record<string, string>,
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(url, { ...mergedOptions, headers: retryHeaders });
    } else {
      // Refresh failed — force logout
      useAuthStore.getState().logout();
    }
  }

  return response;
}
