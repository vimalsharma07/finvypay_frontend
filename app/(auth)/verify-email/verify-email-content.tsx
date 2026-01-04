'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/dist/client/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle, Mail } from 'lucide-react';
import { verifyEmail } from '@/lib/services/auth';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoaderCircleIcon } from 'lucide-react';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>('Verifying...');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Suspense>
      <div className="w-full space-y-6">
        <div className="space-y-2 pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Email Verification
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Please wait while we verify your email address
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

            <Button asChild className="w-full h-11">
              <Link href="/signin">
                Go back to Sign In
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

