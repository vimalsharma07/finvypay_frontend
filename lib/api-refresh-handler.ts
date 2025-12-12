/**
 * Refresh Token Handler
 * Handles automatic token refresh on 401 errors
 */

import { clearAuthData, storeAuthData } from './auth-storage';
import { authRoutes } from './routes/auth-routes';

const isServer = typeof window === 'undefined';
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

// Shared refresh promise to prevent concurrent refreshes
let refreshPromise: Promise<string | null> | null = null;

// Track waiting requests to reject on refresh failure
const waitingRequests: Array<{ reject: (error: Error) => void }> = [];

/**
 * Clear all auth and reset refresh state
 */
export function clearAuthState(): void {
  if (isServer) return;
  refreshPromise = null;
  clearAuthData();
  
  // Clear in-memory token via api.ts
  if (typeof window !== 'undefined') {
    import('./api').then(({ setAccessToken }) => {
      setAccessToken(null);
    });
  }
  
  // Reject all waiting requests
  const requests = [...waitingRequests];
  waitingRequests.length = 0;
  requests.forEach(({ reject }) => {
    reject(new Error('Session expired. Please login again.'));
  });
  
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:logout', { 
      detail: { reason: 'refresh_failed' } 
    }));
    try {
      const channel = new BroadcastChannel('auth');
      channel.postMessage({ type: 'logout', reason: 'refresh_failed' });
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
    // Wait for existing refresh, but track this request for rejection on failure
    return new Promise((resolve, reject) => {
      waitingRequests.push({ reject });
      refreshPromise!.then(resolve).catch(reject);
    });
  }

  refreshPromise = (async (): Promise<string | null> => {
    try {
      // Refresh token is now in httpOnly cookie (credentials: 'include' sends it)
      // No need to read from localStorage
      const response = await fetch(`${API_BASE_URL}${authRoutes.refresh}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Sends httpOnly refresh token cookie
        // Remove body - server reads from cookie
        // body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        clearAuthState();
        return null;
      }

      // Defensive parsing: handle multiple response shapes
      let newAccessToken: string | null = null;
      let newRefreshToken: string | null = null;

      // Shape 1: { data: { accessToken: { accessToken: "...", refreshToken: "..." } } }
      if (data?.data?.accessToken?.accessToken) {
        newAccessToken = data.data.accessToken.accessToken;
        newRefreshToken = data.data.accessToken.refreshToken;
      }
      // Shape 2: { data: { accessToken: "...", refreshToken: "..." } }
      else if (data?.data?.accessToken && typeof data.data.accessToken === 'string') {
        newAccessToken = data.data.accessToken;
        newRefreshToken = data.data.refreshToken;
      }
      // Shape 3: { accessToken: "...", refreshToken: "..." }
      else if (data?.accessToken) {
        newAccessToken = typeof data.accessToken === 'string' 
          ? data.accessToken 
          : data.accessToken.accessToken;
        newRefreshToken = data.refreshToken;
      }

      // Sanity check: token should be a non-empty string
      if (!newAccessToken || typeof newAccessToken !== 'string' || newAccessToken.length < 10) {
        clearAuthState();
        return null;
      }

      // Store access token in memory via api.ts
      if (typeof window !== 'undefined') {
        const { setAccessToken } = await import('./api');
        setAccessToken(newAccessToken);
      }
      
      // Store user data if available (but not refresh token - it's in cookie)
      if (data?.data) {
        storeAuthData({
          accessToken: newAccessToken,
          sessionId: data.data.sessionId,
          tokenExpiry: data.data.tokenExpiry,
          userData: data.data,
        });
      }

      // Resolve all waiting requests
      const requests = [...waitingRequests];
      waitingRequests.length = 0;
      requests.forEach(({ reject }) => {
        // Request will resolve with the token
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

