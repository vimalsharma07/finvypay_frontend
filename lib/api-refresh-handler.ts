/**
 * Refresh Token Handler
 * Handles automatic token refresh on 401 errors
 */

import { clearAuthData, getRefreshToken, storeAuthData } from './auth-storage';
import { authRoutes } from './routes/auth-routes';

const isServer = typeof window === 'undefined';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

// Shared refresh promise to prevent concurrent refreshes
let refreshPromise: Promise<string | null> | null = null;

/**
 * Clear all auth and reset refresh state
 */
export function clearAuthState(): void {
  if (isServer) return;
  refreshPromise = null;
  clearAuthData();
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'manual_logout' } 
    }));
    try {
      const channel = new BroadcastChannel('auth');
      channel.postMessage({ type: 'logout', reason: 'manual_logout' });
    } catch (e) {
      // BroadcastChannel not supported
    }
  }
}

/**
 * Refresh access token
 * Returns new access token or null if refresh failed
 */
async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    clearAuthState();
    return null;
  }

  refreshPromise = (async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}${authRoutes.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        clearAuthState();
        return null;
      }

      const newAccessToken = data?.data?.accessToken?.accessToken || data?.data?.accessToken;
      const newRefreshToken = data?.data?.accessToken?.refreshToken || data?.data?.refreshToken;

      if (!newAccessToken) {
        clearAuthState();
        return null;
      }

      storeAuthData({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken || refreshTokenValue,
      });

      return newAccessToken;
    } catch (error) {
      clearAuthState();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Handle 401 refresh - called from api.ts
 * Returns new access token or null if refresh failed
 */
export async function handle401Refresh(): Promise<string | null> {
  return refreshAccessToken();
}

