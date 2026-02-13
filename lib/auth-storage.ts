// lib/auth-storage.ts
// Advanced authentication storage utility

const AUTH_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_ID: 'session_id',
  TOKEN_EXPIRY: 'token_expiry',
  USER: 'user',
  USER_PROFILE: 'user_profile',
  IMPERSONATION: 'impersonation',
} as const;

/**
 * Store authentication tokens and user data
 * Tokens are stored in sessionStorage for security (cleared on tab close)
 * User data remains in localStorage for persistence across page reloads
 */
export function storeAuthData(data: {
  accessToken: string;
  refreshToken?: string;
  sessionId?: string;
  tokenExpiry?: string;
  userData?: any;
}): void {
  if (typeof window === 'undefined') return;

  try {
    // Store tokens in sessionStorage (cleared on tab close)
    sessionStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, data.accessToken);
    
    if (data.refreshToken) {
      sessionStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    
    if (data.sessionId) {
      sessionStorage.setItem(AUTH_KEYS.SESSION_ID, data.sessionId);
    }
    
    if (data.tokenExpiry) {
      sessionStorage.setItem(AUTH_KEYS.TOKEN_EXPIRY, data.tokenExpiry);
    }

    // Store user data: use sessionStorage when impersonating so admin tab is not affected
    if (data.userData) {
      const isImpersonation = sessionStorage.getItem(AUTH_KEYS.IMPERSONATION) === '1';
      const userProfile = {
        id: data.userData.id,
        email: data.userData.email,
        name: data.userData.name,
        role: data.userData.role,
        profileImage: data.userData.profileImage,
        avatarUrl: data.userData.avatarUrl,
        isProfileCompleted: data.userData.isProfileCompleted,
        isKycCompleted: data.userData.isKycCompleted,
        emailVerifiedAt: data.userData.emailVerifiedAt,
        createdAt: data.userData.createdAt,
        updatedAt: data.userData.updatedAt,
      };
      if (isImpersonation) {
        sessionStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.userData));
        sessionStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      } else {
        localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.userData));
        localStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(userProfile));
      }
    }
  } catch (error) {
    console.error('Failed to store auth data:', error);
  }
}

/**
 * Set user (and profile) in sessionStorage only. Used by impersonation window so admin tab is not affected.
 */
export function setSessionUserOnly(userData: any): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(AUTH_KEYS.USER, JSON.stringify(userData));
    const userProfile = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      profileImage: userData.profileImage,
      avatarUrl: userData.avatarUrl,
      isProfileCompleted: userData.isProfileCompleted,
      isKycCompleted: userData.isKycCompleted,
      emailVerifiedAt: userData.emailVerifiedAt,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
    sessionStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(userProfile));
  } catch (error) {
    console.error('Failed to set session user:', error);
  }
}

/**
 * Get access token from sessionStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token from sessionStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
}

/**
 * Get session ID from sessionStorage
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(AUTH_KEYS.SESSION_ID);
}

/**
 * Get token expiry from sessionStorage
 */
export function getTokenExpiry(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(AUTH_KEYS.TOKEN_EXPIRY);
}

/**
 * Get user data.
 * In impersonation window we read from sessionStorage first so the admin tab's localStorage is never used.
 */
export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // Impersonation: user lives only in this tab's sessionStorage; never touch localStorage
    const sessionUser = sessionStorage.getItem(AUTH_KEYS.USER);
    if (sessionUser) {
      return JSON.parse(sessionUser);
    }

    // First, try to get from Zustand store (single source of truth)
    try {
      const { useAuthStore } = require('@/lib/stores/auth-store');
      const state = useAuthStore.getState();
      if (state?.user) {
        return state.user;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[getUser] Zustand store not available, using localStorage fallback');
      }
    }
    
    // Fallback to localStorage (for backward compatibility)
    const user = localStorage.getItem(AUTH_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getUser] Error retrieving user data:', error);
    }
    return null;
  }
}

/**
 * Get user profile (without sensitive data).
 * Prefer sessionStorage when in impersonation so admin tab is not affected.
 */
export function getUserProfile(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const sessionProfile = sessionStorage.getItem(AUTH_KEYS.USER_PROFILE);
    if (sessionProfile) return JSON.parse(sessionProfile);
    const profile = localStorage.getItem(AUTH_KEYS.USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAccessToken() !== null;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry();
  if (!expiry) return true;
  
  try {
    const expiryDate = new Date(expiry);
    return expiryDate < new Date();
  } catch {
    return true;
  }
}

/**
 * Clear all authentication data
 * Clears tokens and, when impersonating, session-only user; otherwise clears localStorage user.
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(AUTH_KEYS.SESSION_ID);
    sessionStorage.removeItem(AUTH_KEYS.TOKEN_EXPIRY);
    sessionStorage.removeItem(AUTH_KEYS.USER);
    sessionStorage.removeItem(AUTH_KEYS.USER_PROFILE);
    sessionStorage.removeItem(AUTH_KEYS.IMPERSONATION);

    localStorage.removeItem(AUTH_KEYS.USER);
    localStorage.removeItem(AUTH_KEYS.USER_PROFILE);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

