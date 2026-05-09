// lib/auth-storage.ts
// Advanced authentication storage utility

const AUTH_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_ID: 'session_id',
  TOKEN_EXPIRY: 'token_expiry',
  USER: 'user',
  USER_PROFILE: 'user_profile',
} as const;

function isImpersonationWindow(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('impersonation_window') === '1';
}

function getUserDataStorage(): Storage {
  if (typeof window === 'undefined') return localStorage;
  return isImpersonationWindow() ? sessionStorage : localStorage;
}

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

    // Store user data in window-scoped storage:
    // normal tabs -> localStorage, impersonation popup -> sessionStorage.
    if (data.userData) {
      const userStorage = getUserDataStorage();
      userStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.userData));
      
      // Store user profile (without sensitive data)
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
      userStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    }
  } catch (error) {
    console.error('Failed to store auth data:', error);
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
 * Get user data
 */
export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  
  try {
    // First, try to get from Zustand store (single source of truth)
    // This ensures consistency with the Zustand store
    try {
      // Dynamic import to avoid circular dependencies
      const { useAuthStore } = require('@/lib/stores/auth-store');
      const state = useAuthStore.getState();
      if (state?.user) {
        return state.user;
      }
    } catch (error) {
      // Zustand store not available or error accessing it
      // Fall through to localStorage fallback
      if (process.env.NODE_ENV === 'development') {
        console.debug('[getUser] Zustand store not available, using localStorage fallback');
      }
    }
    
    // Fallback to window-scoped storage.
    const userStorage = getUserDataStorage();
    const user = userStorage.getItem(AUTH_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[getUser] Error retrieving user data:', error);
    }
    return null;
  }
}

/**
 * Get user profile (without sensitive data)
 */
export function getUserProfile(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const userStorage = getUserDataStorage();
    const profile = userStorage.getItem(AUTH_KEYS.USER_PROFILE);
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
 * Clears tokens from sessionStorage and user data from localStorage
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear tokens from sessionStorage
    sessionStorage.removeItem(AUTH_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(AUTH_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(AUTH_KEYS.SESSION_ID);
    sessionStorage.removeItem(AUTH_KEYS.TOKEN_EXPIRY);
    
    // Clear user data from current window's storage context only.
    const userStorage = getUserDataStorage();
    userStorage.removeItem(AUTH_KEYS.USER);
    userStorage.removeItem(AUTH_KEYS.USER_PROFILE);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

