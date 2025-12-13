/**
 * Logout Utility
 * 
 * Handles user logout: API call, clearing auth state, and redirect
 */

import { logout as logoutApi } from '@/lib/services/auth';
import { getSessionId } from '@/lib/auth-storage';
import { clearAuthState } from '@/lib/api-refresh-handler';

/**
 * Perform complete logout
 * 
 * 1. Calls logout API
 * 2. Clears all auth data (localStorage, in-memory tokens)
 * 3. Broadcasts logout event to other tabs
 * 4. Redirects to signin page
 * 
 * @param redirectToSignin - Whether to redirect to signin (default: true)
 */
export async function performLogout(redirectToSignin: boolean = true): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Get sessionId before clearing
    const sessionId = getSessionId();

    // Call logout API (even if it fails, we'll still clear local state)
    try {
      await logoutApi(sessionId || '');
    } catch (error) {
      // Log error but continue with local cleanup
      if (process.env.NODE_ENV === 'development') {
        console.warn('[performLogout] Logout API call failed, continuing with local cleanup:', error);
      }
    }

    // Clear all auth state (clearAuthState already calls clearAuthData and setAccessToken)
    clearAuthState();

    // Broadcast logout event to other tabs
    try {
      window.dispatchEvent(new CustomEvent('auth:logout', {
        detail: { reason: 'manual_logout', message: 'User logged out' }
      }));

      const channel = new BroadcastChannel('auth');
      channel.postMessage({ type: 'logout', reason: 'manual_logout' });
      channel.close();
    } catch (e) {
      // BroadcastChannel not supported, continue
    }

    // Redirect to signin
    if (redirectToSignin) {
      window.location.href = '/signin';
    }
  } catch (error) {
    console.error('[performLogout] Error during logout:', error);
    // Even on error, try to clear state and redirect
    clearAuthState();
    
    if (redirectToSignin) {
      window.location.href = '/signin';
    }
  }
}

