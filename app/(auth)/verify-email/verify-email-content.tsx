'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { verifyEmail } from '@/lib/services/auth';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';
import { isAuthenticated } from '@/lib/auth-storage';
import { getRedirectPathByRole, getUserRole } from '@/lib/utils/menu-utils';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>('Verifying...');
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      const redirectPath = getRedirectPathByRole(userRole);
      router.replace(redirectPath);
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  const verify = useCallback(
    async (token: string) => {
      try {
      const response = await verifyEmail({ token });

      handleApiResponse(response, {
        onSuccess: (data) => {
          setError(null);
          setMessage(data?.message || 'Your email has been successfully verified!');
          setTimeout(() => {
            router.push('/signin');
          }, 2000);
        },
        onError: (errorMessage) => {
          setMessage(null);
          setError(errorMessage || 'An error occurred during verification.');
        },
      });
    } catch (error: any) {
      setMessage(null);
      const errorMessage = error?.message || 'An error occurred during verification.';
      setError(errorMessage);
    }
    },
    [router],
  );

  useEffect(() => {
    const token = searchParams?.get('token');

    if (!token) {
      setMessage(null);
      setError('Invalid or missing token.');
      return;
    }

    verify(token);
  }, [searchParams, verify]);

  // Show loading state while checking authentication
  if (isCheckingAuth || isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <LoaderCircleIcon className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense>
      <div className="w-full space-y-6">
        <div className="space-y-3 border-b border-zinc-200 pb-5 dark:border-slate-600">
          <div className="auth-icon-mark">
            <Mail className="h-4 w-4" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-slate-50">
            Email verification
          </h1>
          <p className="text-sm text-zinc-500 dark:text-slate-400">
            Confirming your account email
          </p>
        </div>

        {error && (
          <div className="space-y-4">
            <Alert variant="destructive" className="border-destructive/50">
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle className="text-sm">{error}</AlertTitle>
            </Alert>

            <Button asChild className="auth-btn-primary h-11 w-full text-sm font-semibold">
              <Link href="/signin">
                Back to sign in
              </Link>
            </Button>
          </div>
        )}

        {message && (
          <Alert className={message.includes('success') ? 'bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800' : ''}>
            <AlertIcon>
              {message.includes('success') ? (
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <LoaderCircleIcon className="size-4 animate-spin" />
              )}
            </AlertIcon>
            <AlertTitle className={`text-sm ${message.includes('success') ? 'text-green-800 dark:text-green-200' : ''}`}>
              {message}
            </AlertTitle>
          </Alert>
        )}
      </div>
    </Suspense>
  );
}

