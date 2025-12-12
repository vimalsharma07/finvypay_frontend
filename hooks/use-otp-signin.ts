// hooks/use-otp-signin.ts
// Reusable hook for OTP-based signin with email verification

import { useState, useCallback } from 'react';
import { sendOtp, verifyOtp as verifyOtpApi } from '@/lib/services/auth';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export interface UseOtpSigninOptions {
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
}

export interface UseOtpSigninReturn {
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  error: string | null;
  success: string | null;
  otpSent: boolean;
  resetState: () => void;
}

/**
 * Custom hook for OTP-based signin
 * 
 * Handles two-step OTP signin flow:
 * 1. Send OTP to email via /auth/email
 * 2. Verify OTP via /auth/email/verify
 * 
 * @param options - Configuration options
 * @returns Object with send/verify functions, loading states, and messages
 * 
 * @example
 * ```tsx
 * const { sendOtp, verifyOtp, isSendingOtp, isVerifyingOtp, error, success, otpSent } = useOtpSignin({
 *   onSuccess: (response) => router.push('/'),
 *   onError: (error) => setError(error),
 * });
 * 
 * await sendOtp('user@example.com');
 * await verifyOtp('user@example.com', '123456');
 * ```
 */
export function useOtpSignin({
  onSuccess,
  onError,
}: UseOtpSigninOptions = {}): UseOtpSigninReturn {
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  // Step 1: Send OTP to email
  const sendOtp = useCallback(async (email: string): Promise<void> => {
    setError(null);
    setSuccess(null);

    // Validate email format
    if (!email || !email.trim()) {
      const errorMsg = 'Please enter your email address.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!validateEmail(email)) {
      const errorMsg = 'Please enter a valid email address.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsSendingOtp(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await sendOtp({ email: email.trim() });

      handleApiResponse(response, {
        onSuccess: (data) => {
          const successMessage = 
            data?.message || 
            'OTP has been sent to your email. Please check your inbox.';
          
          setSuccess(successMessage);
          setOtpSent(true);
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            setSuccess(null);
          }, 5000);
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Failed to send OTP. Please try again.');
          onError?.(errorMessage || 'Failed to send OTP. Please try again.');
          setOtpSent(false);
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
      setOtpSent(false);
    } finally {
      setIsSendingOtp(false);
    }
  }, [validateEmail, onError]);

  // Step 2: Verify OTP and complete signin
  const verifyOtp = useCallback(async (email: string, otp: string): Promise<void> => {
    setError(null);
    setSuccess(null);

    // Validate inputs
    if (!email || !email.trim()) {
      const errorMsg = 'Email is required.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!otp || !otp.trim()) {
      const errorMsg = 'OTP is required.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      const errorMsg = 'OTP must be exactly 6 digits.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsVerifyingOtp(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await verifyOtpApi({
        email: email.trim(),
        otp: otp.trim(),
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          // Call success callback
          onSuccess?.(data);
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'OTP verification failed. Please try again.');
          onError?.(errorMessage || 'OTP verification failed. Please try again.');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OTP verification failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [onSuccess, onError]);

  // Reset state (useful for switching between login methods)
  const resetState = useCallback(() => {
    setError(null);
    setSuccess(null);
    setOtpSent(false);
    setIsSendingOtp(false);
    setIsVerifyingOtp(false);
  }, []);

  return {
    sendOtp,
    verifyOtp,
    isSendingOtp,
    isVerifyingOtp,
    error,
    success,
    otpSent,
    resetState, // Expose for manual reset
  } as UseOtpSigninReturn & { resetState: () => void };
}

