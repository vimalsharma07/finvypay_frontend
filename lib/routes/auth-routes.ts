/**
 * Auth Routes
 * All endpoints related to authentication operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const authRoutes = {
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  validation: '/auth/validation',
  register: '/auth/register',
  verify: '/auth/verify',
  googleLogin: '/auth/google-login',
  forgotPassword: '/auth/forgot-password',
  resetPassword: '/auth/reset-password',
  changePassword: '/auth/change-password',
  verifyEmail: '/auth/verify-email',
  resendVerification: '/auth/resend-verification',
  sendOtp: '/auth/email',
  verifyOtp: '/auth/email/verify',
  permissions: '/auth/permissions',
  verify2FA: '/auth/2fa/verify',
} as const;

