// hooks/use-resend-otp.ts
// Reusable hook for resending OTP with cooldown timer and error handling

import { useState, useCallback, useRef, useEffect } from 'react';
import { http, ApiError } from '@/lib/api';

interface UseResendOtpOptions {
  email: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  cooldownSeconds?: number; // Default cooldown time in seconds
}

interface UseResendOtpReturn {
  resendOtp: () => Promise<void>;
  isResending: boolean;
  cooldownRemaining: number;
  canResend: boolean;
}

/**
 * Custom hook for resending OTP
 * 
 * @param options - Configuration options
 * @returns Object with resend function, loading state, and cooldown info
 * 
 * @example
 * ```tsx
 * const { resendOtp, isResending, cooldownRemaining, canResend } = useResendOtp({
 *   email: 'user@example.com',
 *   onSuccess: (message) => console.log(message),
 *   onError: (error) => console.error(error),
 *   cooldownSeconds: 60
 * });
 * ```
 */
export function useResendOtp({
  email,
  onSuccess,
  onError,
  cooldownSeconds = 60, // Default 60 seconds cooldown
}: UseResendOtpOptions): UseResendOtpReturn {
  const [isResending, setIsResending] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setCooldownRemaining((prev) => {
          if (prev <= 1) {
            if (cooldownTimerRef.current) {
              clearInterval(cooldownTimerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    }

    return () => {
      if (cooldownTimerRef.current) {
        clearInterval(cooldownTimerRef.current);
      }
    };
  }, [cooldownRemaining]);

  const resendOtp = useCallback(async () => {
    // Validate email
    if (!email || !email.includes('@')) {
      const errorMsg = 'Please provide a valid email address.';
      onError?.(errorMsg);
      return;
    }

    // Check if still in cooldown
    if (cooldownRemaining > 0) {
      const errorMsg = `Please wait ${cooldownRemaining} seconds before requesting a new OTP.`;
      onError?.(errorMsg);
      return;
    }

    setIsResending(true);

    try {
      const response = await http.put(
        '/auth/resend-otp',
        {
          email,
        },
        {
          auth: false,
        }
      );

      // Handle successful response
      if (response?.success || response?.message) {
        const successMessage = response?.message || 'OTP has been resent successfully. Please check your email.';
        onSuccess?.(successMessage);
        
        // Start cooldown timer
        setCooldownRemaining(cooldownSeconds);
      } else {
        throw new Error('Unexpected response format from server.');
      }
    } catch (err) {
      let errorMessage = 'Failed to resend OTP. Please try again.';
      
      if (err instanceof ApiError) {
        errorMessage = 
          err.data?.message || 
          err.data?.error || 
          err.message || 
          errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      onError?.(errorMessage);
    } finally {
      setIsResending(false);
    }
  }, [email, cooldownRemaining, cooldownSeconds, onSuccess, onError]);

  const canResend = !isResending && cooldownRemaining === 0 && !!email;

  return {
    resendOtp,
    isResending,
    cooldownRemaining,
    canResend,
  };
}

