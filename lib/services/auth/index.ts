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

// Login payload
export interface LoginPayload {
  email: string;
  password: string;
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

// Reset password payload
export interface ResetPasswordPayload {
  token: string;
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

    // If login is successful, store auth data
    if (response?.success && response?.data?.accessToken) {
      // Extract access token and refresh token (handle both string and object formats)
      let accessTokenValue: string;
      let refreshTokenValue: string | undefined;
      
      if (typeof response.data.accessToken === 'object' && response.data.accessToken !== null) {
        // Nested structure: { accessToken: { accessToken: "...", refreshToken: "..." } }
        accessTokenValue = (response.data.accessToken as any).accessToken || response.data.accessToken;
        refreshTokenValue = (response.data.accessToken as any).refreshToken;
      } else {
        // Direct string or check for separate refreshToken field
        accessTokenValue = response.data.accessToken as string;
        refreshTokenValue = response.data.refreshToken;
      }
      
      // Set access token in memory
      if (typeof window !== 'undefined') {
        const { setAccessToken } = await import('../../api');
        setAccessToken(accessTokenValue);
      }
      
      // Store both tokens in sessionStorage
      storeAuthData({
        accessToken: accessTokenValue,
        refreshToken: refreshTokenValue,
        sessionId: response.data.sessionId,
        tokenExpiry: response.data.tokenExpiry,
        userData: response.data,
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
        userData: response.data,
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
 * Send password reset link
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
 * Reset password with token
 * 
 * @param payload - Reset token and new password
 * @returns Promise with success message
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ApiResponse<{ success: boolean; message: string }>> {
  try {
    const response = await http.post(
      authRoutes.resetPassword,
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
        userData: response.data,
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
        userData: response.data,
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

