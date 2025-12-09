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

/**
 * Store authentication tokens and user data
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
    // Store tokens
    localStorage.setItem(AUTH_KEYS.ACCESS_TOKEN, data.accessToken);
    
    if (data.refreshToken) {
      localStorage.setItem(AUTH_KEYS.REFRESH_TOKEN, data.refreshToken);
    }
    
    if (data.sessionId) {
      localStorage.setItem(AUTH_KEYS.SESSION_ID, data.sessionId);
    }
    
    if (data.tokenExpiry) {
      localStorage.setItem(AUTH_KEYS.TOKEN_EXPIRY, data.tokenExpiry);
    }

    // Store user data
    if (data.userData) {
      localStorage.setItem(AUTH_KEYS.USER, JSON.stringify(data.userData));
      
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
      localStorage.setItem(AUTH_KEYS.USER_PROFILE, JSON.stringify(userProfile));
    }
  } catch (error) {
    console.error('Failed to store auth data:', error);
  }
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_KEYS.REFRESH_TOKEN);
}

/**
 * Get session ID
 */
export function getSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_KEYS.SESSION_ID);
}

/**
 * Get token expiry
 */
export function getTokenExpiry(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_KEYS.TOKEN_EXPIRY);
}

/**
 * Get user data
 */
export function getUser(): any | null {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem(AUTH_KEYS.USER);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

/**
 * Get user profile (without sensitive data)
 */
export function getUserProfile(): any | null {
  if (typeof window === 'undefined') return null;
  try {
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
 */
export function clearAuthData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    Object.values(AUTH_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

