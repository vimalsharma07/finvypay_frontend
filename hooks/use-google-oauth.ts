// hooks/use-google-oauth.ts
// Reusable React hook for Google OAuth authentication

import { useState, useCallback, useEffect, useRef } from 'react';
import { googleLogin } from '@/lib/services/auth-api';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export interface UseGoogleOAuthOptions {
  clientId?: string;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
  autoLoad?: boolean; // Auto-load Google script on mount
}

export interface UseGoogleOAuthReturn {
  signInWithGoogle: () => Promise<void>;
  isProcessing: boolean;
  isGoogleLoaded: boolean;
  error: string | null;
}

/**
 * Custom hook for Google OAuth authentication
 * 
 * @param options - Configuration options
 * @returns Object with sign-in function and state
 * 
 * @example
 * ```tsx
 * const { signInWithGoogle, isProcessing, error } = useGoogleOAuth({
 *   clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
 *   onSuccess: (response) => router.push('/'),
 *   onError: (error) => setError(error),
 * });
 * ```
 */
export function useGoogleOAuth({
  clientId,
  onSuccess,
  onError,
  autoLoad = true,
}: UseGoogleOAuthOptions = {}): UseGoogleOAuthReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);

  // Get Google Client ID from environment or config
  const googleClientId = clientId || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

  // Load Google Identity Services script
  const loadGoogleScript = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.accounts?.id) {
        setIsGoogleLoaded(true);
        resolve();
        return;
      }

      if (scriptLoadedRef.current) {
        // Script is loading, wait for it
        const checkInterval = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkInterval);
            setIsGoogleLoaded(true);
            resolve();
          }
        }, 100);
        return;
      }

      scriptLoadedRef.current = true;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
        resolve();
      };
      script.onerror = () => {
        scriptLoadedRef.current = false;
        reject(new Error('Failed to load Google Identity Services'));
      };
      document.head.appendChild(script);
    });
  }, []);

  // Handle Google login API call
  const handleGoogleLogin = useCallback(async (idToken: string): Promise<void> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await googleLogin({ idToken });

      handleApiResponse(response, {
        onSuccess: (data) => {
          onSuccess?.(data);
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Google login failed. Please try again.');
          onError?.(errorMessage || 'Google login failed. Please try again.');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [onSuccess, onError]);

  // Main sign-in function - uses Google Sign-In button flow
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    if (!googleClientId) {
      const errorMsg = 'Google Client ID is not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    try {
      // Load Google script if not already loaded
      if (!isGoogleLoaded) {
        await loadGoogleScript();
      }

      if (!window.google?.accounts?.id) {
        throw new Error('Google Identity Services failed to load.');
      }

      setIsProcessing(true);
      setError(null);

      // Initialize Google Identity Services with callback
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          if (response?.credential) {
            // Got ID token, proceed with login
            await handleGoogleLogin(response.credential);
          } else {
            const errorMsg = 'Failed to get Google ID token.';
            setError(errorMsg);
            onError?.(errorMsg);
            setIsProcessing(false);
          }
        },
      });

      // Create a temporary hidden div for Google button
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.opacity = '0';
      tempDiv.style.pointerEvents = 'none';
      document.body.appendChild(tempDiv);

      // Render Google button in temp div
      window.google.accounts.id.renderButton(tempDiv, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
      });

      // Wait for button to render, then click it programmatically
      setTimeout(() => {
        const googleButton = tempDiv.querySelector('div[role="button"]') as HTMLElement;
        if (googleButton) {
          googleButton.click();
        } else {
          // Fallback: try prompt method if button rendering fails
          if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              const reasons = notification.getNotDisplayedReason();
              let errorMsg = 'Google sign-in is not available. ';
              
              if (reasons === 'browser_not_supported') {
                errorMsg += 'Your browser is not supported.';
              } else if (reasons === 'invalid_client') {
                errorMsg += 'Invalid Google Client ID configuration.';
              } else if (reasons === 'missing_client_id') {
                errorMsg += 'Google Client ID is missing.';
              } else {
                errorMsg += 'Please try again or use email/password login.';
              }
              
              setError(errorMsg);
              onError?.(errorMsg);
              setIsProcessing(false);
            } else if (notification.isSkippedMoment() || notification.isDismissedMoment()) {
              setIsProcessing(false);
            }
          });
          } else {
            // Google Identity Services not available
            const errorMsg = 'Google sign-in is not available. Please try again or use email/password login.';
            setError(errorMsg);
            onError?.(errorMsg);
            setIsProcessing(false);
          }
        }
        
        // Clean up temp div after a delay
        setTimeout(() => {
          if (tempDiv.parentNode) {
            tempDiv.parentNode.removeChild(tempDiv);
          }
        }, 1000);
      }, 200);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Google sign-in.';
      setError(errorMessage);
      onError?.(errorMessage);
      setIsProcessing(false);
    }
  }, [googleClientId, isGoogleLoaded, loadGoogleScript, handleGoogleLogin, onError]);

  // Auto-load script on mount if enabled
  useEffect(() => {
    if (autoLoad && !isGoogleLoaded && !scriptLoadedRef.current) {
      loadGoogleScript().catch(() => {
        // Silently fail - will retry on sign-in attempt
      });
    }
  }, [autoLoad, isGoogleLoaded, loadGoogleScript]);

  return {
    signInWithGoogle,
    isProcessing,
    isGoogleLoaded,
    error,
  };
}

// Extend Window interface for Google types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: (callback?: (notification: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
        };
        oauth2: {
          initTokenClient: (config: any) => any;
        };
      };
    };
  }
}

