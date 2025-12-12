// hooks/use-forgot-password.ts
// Reusable hook for forgot password functionality with rate limiting and error handling

import { useState, useCallback, useRef, useEffect } from 'react';
import { forgotPassword } from '@/lib/services/auth-api';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export interface UseForgotPasswordOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
  cooldownSeconds?: number; // Rate limiting cooldown time in seconds
}

export interface UseForgotPasswordReturn {
  sendResetLink: (email: string) => Promise<void>;
  isProcessing: boolean;
  cooldownRemaining: number;
  canSend: boolean;
  error: string | null;
  success: string | null;
}

/**
 * Custom hook for forgot password functionality
 * 
 * @param options - Configuration options
 * @returns Object with send function, loading state, cooldown info, and messages
 * 
 * @example
 * ```tsx
 * const { sendResetLink, isProcessing, cooldownRemaining, canSend, error, success } = useForgotPassword({
 *   onSuccess: (message) => toast.success(message),
 *   onError: (error) => toast.error(error),
 *   cooldownSeconds: 60
 * });
 * 
 * await sendResetLink('user@example.com');
 * ```
 */
export function useForgotPassword({
  onSuccess,
  onError,
  cooldownSeconds = 60, // Default 60 seconds cooldown
}: UseForgotPasswordOptions = {}): UseForgotPasswordReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  // Validate email format
  const validateEmail = useCallback((email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }, []);

  // Main function to send reset link
  const sendResetLink = useCallback(async (email: string): Promise<void> => {
    // Clear previous messages
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

    // Check if still in cooldown
    if (cooldownRemaining > 0) {
      const errorMsg = `Please wait ${cooldownRemaining} seconds before requesting another reset link.`;
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await forgotPassword({ email: email.trim() });

      handleApiResponse(response, {
        onSuccess: (data) => {
          const successMessage = 
            data?.message || 
            'Password reset link has been sent to your email. Please check your inbox.';
          
          setSuccess(successMessage);
          onSuccess?.(successMessage);
          
          // Start cooldown timer
          setCooldownRemaining(cooldownSeconds);
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Failed to send password reset link. Please try again.');
          onError?.(errorMessage || 'Failed to send password reset link. Please try again.');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset link. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [cooldownRemaining, cooldownSeconds, validateEmail, onSuccess, onError]);

  // Reset state (useful for closing dialog)
  const resetState = useCallback(() => {
    setError(null);
    setSuccess(null);
    setIsProcessing(false);
  }, []);

  const canSend = !isProcessing && cooldownRemaining === 0;

  return {
    sendResetLink,
    isProcessing,
    cooldownRemaining,
    canSend,
    error,
    success,
  };
}

