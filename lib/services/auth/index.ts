/**
 * Auth API Service
 * 
 * Centralized API calls for authentication operations
 * All auth-related API calls should be defined here
 */

import { http, ApiError } from '../../api';
import { storeAuthData } from '../../auth-storage';
import { authRoutes } from '../../routes/auth-routes';
import type { ApiResponse } from '../types';

// Re-export ApiResponse for convenience
export type { ApiResponse } from '../types';

// ============================================
// TYPES & INTERFACES
// ============================================

// Login payload (matches POST /auth/login: email, password, device, os)
export interface LoginPayload {
  email: string;
  password: string;
  device?: string;
  os?: string;
}

// Register payload
export interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

// Validation payload
export interface ValidateUserPayload {
  email: string;
  password: string;
}

// Google login payload
export interface GoogleLoginPayload {
  idToken: string;
}

// Forgot password payload
export interface ForgotPasswordPayload {
  email: string;
}

// Reset password payload (OTP-based)
export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

// Change password payload
export interface ChangePasswordPayload {
  token: string;
  newPassword: string;
}

// Verify email payload
export interface VerifyEmailPayload {
  token: string;
}

// Send OTP payload
export interface SendOtpPayload {
  email: string;
}

// Verify OTP payload
export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

// Verify registration OTP payload
export interface VerifyRegistrationOtpPayload {
  email: string;
  otp: string;
}

// Verify 2FA payload
export interface Verify2FAPayload {
  email: string;
  otp: string;
  device?: string;
  os?: string;
}

// Refresh token payload
export interface RefreshTokenPayload {
  refreshToken: string;
}

// Logout payload
export interface LogoutPayload {
  sessionId: string;
}

// Auth response (common structure)
export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken?: string;
    sessionId?: string;
    tokenExpiry?: string;
    [key: string]: any;
  };
  message?: string;
  requires2FA?: boolean;
}

// Refresh token response
export interface RefreshTokenResponse extends AuthResponse {}

// ============================================
// AUTH API FUNCTIONS
// ============================================

/**
 * Login with email and password
 * 
 * @param payload - Login credentials
 * @returns Promise with access token and user data
 */
// Remove non-essential fields from user data before storing locally
function sanitizeAuthUser(user: any) {
  if (!user || typeof user !== 'object') return user;
  const {
    createdAt,
    updatedAt,
    sessionId,
    tokenExpiry,
    accessToken,
    refreshToken,
    ...rest
  } = user;
  return rest;
}

/**
 * Apply auth response (tokens + user data) to storage and in-memory token.
 * Used by login and impersonate flows so session handling is identical.
 * Call this in the window/context where the user should be signed in (e.g. new window for impersonate).
 */
export async function applyAuthResponse(response: AuthResponse): Promise<boolean> {
  if (typeof window === 'undefined' || !response?.success || !response?.data?.accessToken) {
    return false;
  }
  const data = response.data!;
  let accessTokenValue: string;
  let refreshTokenValue: string | undefined;

  if (typeof data.accessToken === 'object' && data.accessToken !== null) {
    accessTokenValue = (data.accessToken as any).accessToken || data.accessToken;
    refreshTokenValue = (data.accessToken as any).refreshToken;
  } else {
    accessTokenValue = data.accessToken as string;
    refreshTokenValue = data.refreshToken;
  }

  const { setAccessToken } = await import('../../api');
  setAccessToken(accessTokenValue);
  storeAuthData({
    accessToken: accessTokenValue,
    refreshToken: refreshTokenValue,
    sessionId: data.sessionId,
    tokenExpiry: data.tokenExpiry,
    userData: sanitizeAuthUser(data),
  });
  return true;
}

export async function login(
  payload: LoginPayload
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await http.post(
      authRoutes.login,
      payload,
      {
        auth: false, // Don't send auth token for login
      }
    ) as AuthResponse;

    if (response?.success && response?.data?.accessToken) {
      await applyAuthResponse(response);
    }

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Register a new user
 * 
 * @param payload - Registration data
 * @returns Promise with registration response
 */
export async function register(
  payload: RegisterPayload
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await http.post(
      authRoutes.register,
      payload,
      {
        auth: false,
      }
    ) as AuthResponse;

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate user credentials before login
 * 
 * @param payload - User credentials
 * @returns Promise with validation response
 */
export async function validateUser(
  payload: ValidateUserPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.validation,
      payload,
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Login with Google OAuth
 * 
 * @param payload - Google ID token
 * @returns Promise with access token and user data
 */
export async function googleLogin(
  payload: GoogleLoginPayload
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await http.post(
      authRoutes.googleLogin,
      payload,
      {
        auth: false,
      }
    ) as AuthResponse;

    // If login is successful, store auth data
    if (response?.success && response?.data?.accessToken) {
      const accessTokenValue = typeof response.data.accessToken === 'object' && response.data.accessToken !== null
        ? (response.data.accessToken as any).accessToken || response.data.accessToken
        : response.data.accessToken;
      
      // Set access token in memory (refresh token is in httpOnly cookie)
      if (typeof window !== 'undefined') {
        const { setAccessToken } = await import('../../api');
        setAccessToken(accessTokenValue);
      }
      
      storeAuthData({
        accessToken: accessTokenValue,
        sessionId: response.data.sessionId,
        tokenExpiry: response.data.tokenExpiry,
        userData: sanitizeAuthUser(response.data),
        // Note: refreshToken no longer stored - it's in httpOnly cookie
      });
    }

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send password reset OTP to email
 * 
 * @param payload - Email address
 * @returns Promise with success message
 */
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.forgotPassword,
      payload,
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Reset password with OTP
 * 
 * @param payload - Email, OTP, and new password
 * @returns Promise with success message
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.resetPassword,
      {
        email: payload.email,
        otp: payload.otp,
        newPassword: payload.newPassword,
      },
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Change password (alternative endpoint)
 * 
 * @param payload - Reset token and new password
 * @returns Promise with success message
 */
export async function changePassword(
  payload: ChangePasswordPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.changePassword,
      {
        token: payload.token,
        newPassword: payload.newPassword,
      },
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify email with token
 * 
 * @param payload - Verification token
 * @returns Promise with success message
 */
export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.verifyEmail,
      payload,
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Resend verification email
 * 
 * @param payload - Email address
 * @returns Promise with success message
 */
export async function resendVerification(
  payload: { email: string }
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.resendVerification,
      payload,
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send OTP to email for signin
 * 
 * @param payload - Email address
 * @returns Promise with success message
 */
export async function sendOtp(
  payload: SendOtpPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.sendOtp,
      payload,
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify OTP for email signin
 * 
 * @param payload - Email and OTP
 * @returns Promise with access token and user data
 */
export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await http.post(
      authRoutes.verifyOtp,
      payload,
      {
        auth: false,
      }
    ) as AuthResponse;

    // If verification is successful, store auth data
    if (response?.success && response?.data?.accessToken) {
      const accessTokenValue = typeof response.data.accessToken === 'object' && response.data.accessToken !== null
        ? (response.data.accessToken as any).accessToken || response.data.accessToken
        : response.data.accessToken;
      
      // Set access token in memory
      if (typeof window !== 'undefined') {
        const { setAccessToken } = await import('../../api');
        setAccessToken(accessTokenValue);
      }
      
      storeAuthData({
        accessToken: accessTokenValue,
        sessionId: response.data.sessionId,
        tokenExpiry: response.data.tokenExpiry,
        userData: sanitizeAuthUser(response.data),
      });
    }

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify registration OTP
 * 
 * @param payload - Email and OTP
 * @returns Promise with success message
 */
export async function verifyRegistrationOtp(
  payload: VerifyRegistrationOtpPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.verify,
      payload,
      {
        auth: false,
      }
    ) as { success: boolean; message: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Verify 2FA OTP for login
 * 
 * @param payload - Email and OTP (and optionally device, os)
 * @returns Promise with access token and user data
 */
export async function verify2FA(
  payload: Verify2FAPayload
): Promise<ApiResponse<AuthResponse>> {
  try {
    const response = await http.post(
      authRoutes.verify2FA,
      payload,
      {
        auth: false,
      }
    ) as AuthResponse;

    // If verification is successful, store auth data
    if (response?.success && response?.data?.accessToken) {
      const accessTokenValue = typeof response.data.accessToken === 'object' && response.data.accessToken !== null
        ? (response.data.accessToken as any).accessToken || response.data.accessToken
        : response.data.accessToken;
      
      const refreshTokenValue = typeof response.data.refreshToken === 'object' && response.data.refreshToken !== null
        ? (response.data.refreshToken as any).refreshToken || response.data.refreshToken
        : response.data.refreshToken;
      
      // Set access token in memory
      if (typeof window !== 'undefined') {
        const { setAccessToken } = await import('../../api');
        setAccessToken(accessTokenValue);
      }
      
      storeAuthData({
        accessToken: accessTokenValue,
        refreshToken: refreshTokenValue,
        sessionId: response.data.sessionId,
        tokenExpiry: response.data.tokenExpiry,
        userData: sanitizeAuthUser(response.data),
      });
    }

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Logout user
 * 
 * @param sessionId - Session ID to logout
 * @returns Promise with logout response
 */
export async function logout(sessionId?: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
  try {
    // Get sessionId from storage if not provided
    const sessionIdToUse = sessionId || (typeof window !== 'undefined' ? 
      (await import('../../auth-storage')).getSessionId() : null);

    if (!sessionIdToUse) {
      // If no sessionId, still clear local state
      return {
        status: 200,
        data: { success: true, message: 'Logged out locally' },
      };
    }

    const response = await http.delete(
      authRoutes.logout,
      { sessionId: sessionIdToUse },
      {
        auth: true,
        json: true,
      }
    ) as { success: boolean; message?: string };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    // Even if API call fails, we should still clear local state
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Refresh access token using refresh token from sessionStorage
 * 
 * @returns Promise with new access token and refresh token
 */
export async function refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
  try {
    // Get refresh token from sessionStorage
    const { getRefreshToken } = await import('../../auth-storage');
    const refreshTokenValue = getRefreshToken();
    
    if (!refreshTokenValue) {
      return {
        status: 401,
        error: 'No refresh token available',
      };
    }

    // Send refresh token in request body
    const response = await http.post(
      authRoutes.refresh,
      { refreshToken: refreshTokenValue },
      {
        auth: false, // Don't send auth token for refresh
      }
    ) as RefreshTokenResponse;

    // If refresh is successful, update stored tokens
    if (response?.success && response?.data?.accessToken) {
      // Handle nested response structure: { data: { accessToken: { accessToken: "...", refreshToken: "..." } } }
      let accessTokenValue: string;
      let newRefreshTokenValue: string | undefined;
      
      const accessTokenData = response.data.accessToken;
      
      if (typeof accessTokenData === 'object' && accessTokenData !== null) {
        // Nested structure: { accessToken: { accessToken: "...", refreshToken: "..." } }
        accessTokenValue = (accessTokenData as any).accessToken || accessTokenData;
        newRefreshTokenValue = (accessTokenData as any).refreshToken;
      } else {
        // Direct string format
        accessTokenValue = accessTokenData as string;
        newRefreshTokenValue = response.data.refreshToken;
      }
      
      // Set access token in memory
      if (typeof window !== 'undefined') {
        const { setAccessToken } = await import('../../api');
        setAccessToken(accessTokenValue);
      }
      
      // Store both new tokens in sessionStorage
      storeAuthData({
        accessToken: accessTokenValue,
        refreshToken: newRefreshTokenValue,
        sessionId: response.data.sessionId,
        tokenExpiry: response.data.tokenExpiry,
        userData: sanitizeAuthUser(response.data),
      });
    }

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user profile
 * Uses GET /auth/profile with Bearer token for all roles (admin and merchant).
 *
 * @returns Promise with user profile data including 2FA status
 */
export async function getProfile(): Promise<ApiResponse<any>> {
  try {
    const response = await http.get(
      authRoutes.profile,
      {
        auth: true, // Requires authentication
      }
    ) as any;

    // Handle nested response structure: {success: true, data: {...}} or direct user object
    const userData = response?.data || response;
    
    // Update storage and Zustand store with the profile data
    if (typeof window !== 'undefined' && userData) {
      try {
        const isImpersonationWindow =
          window.sessionStorage.getItem('impersonation_window') === '1';
        const storage = isImpersonationWindow ? window.sessionStorage : window.localStorage;
        const storedUser = storage.getItem('user');
        let updatedUser;
        if (storedUser) {
          const existingUserData = JSON.parse(storedUser);
          // Merge the profile data with existing user data
          updatedUser = { ...existingUserData, ...userData };
          storage.setItem('user', JSON.stringify(updatedUser));
        } else {
          // If no user data exists, store the profile directly
          updatedUser = userData;
          storage.setItem('user', JSON.stringify(userData));
        }
        
        // Also update Zustand store if available
        try {
          const { useAuthStore } = require('@/lib/stores/auth-store');
          useAuthStore.getState().setUser(updatedUser);
        } catch (storeError) {
          // Zustand store not available, that's okay
          if (process.env.NODE_ENV === 'development') {
            console.debug('Zustand store not available for profile update');
          }
        }
      } catch (err) {
        console.error('Failed to update user data in localStorage:', err);
      }
    }

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user permissions
 * 
 * @returns Promise with user permissions data
 */
export async function getPermissions(): Promise<ApiResponse<{
  success: boolean;
  data: {
    id: string;
    email: string;
    role: string;
    permissions: Array<{
      id: number;
      name: string;
      identifier: string;
      module: string;
      subModule: string;
      type: string;
    }>;
  };
}>> {
  try {
    const response = await http.get(
      authRoutes.permissions,
      {
        auth: true, // Requires authentication
      }
    ) as {
      success: boolean;
      data: {
        id: string;
        email: string;
        role: string;
        permissions: Array<{
          id: number;
          name: string;
          identifier: string;
          module: string;
          subModule: string;
          type: string;
        }>;
      };
    };

    return {
      status: 200,
      data: response,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        status: error.status,
        error: error.message,
        data: error.data,
        errors: error.data?.errors,
        message: error.data?.message,
      };
    }
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

