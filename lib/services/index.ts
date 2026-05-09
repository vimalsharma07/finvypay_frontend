/**
 * Services Index
 * 
 * Centralized exports for all API services
 * Easy access: import { login } from '@/lib/services'
 */

// Re-export shared types
export type { ApiResponse } from './types';

// Re-export admin services (includes getPermissions for admin)
export * from './admin';

// Re-export auth services, but exclude getPermissions to avoid conflict
// Note: Auth getPermissions can be imported directly from '@/lib/services/auth'
export {
  login,
  register,
  validateUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification,
  sendOtp,
  verifyOtp,
  verifyRegistrationOtp,
  refreshToken,
  logout,
  type LoginPayload,
  type RegisterPayload,
  type ValidateUserPayload,
  type GoogleLoginPayload,
  type ForgotPasswordPayload,
  type ResetPasswordPayload,
  type ChangePasswordPayload,
  type VerifyEmailPayload,
  type SendOtpPayload,
  type VerifyOtpPayload,
  type VerifyRegistrationOtpPayload,
  type RefreshTokenPayload,
  type LogoutPayload,
  type AuthResponse,
  type RefreshTokenResponse,
} from './auth';

