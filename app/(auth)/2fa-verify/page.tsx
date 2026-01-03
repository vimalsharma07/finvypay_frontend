'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, Shield, Loader2 } from 'lucide-react';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { verify2FA } from '@/lib/services/auth';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { handleLoginRedirect } from '@/lib/utils/menu-utils';
import { fetchAndStorePermissions } from '@/lib/utils/auth-helpers';
import { toast } from 'sonner';

const verify2FASchema = z.object({
  otp: z
    .string()
    .min(1, { message: 'OTP is required' })
    .length(6, { message: 'OTP must be exactly 6 digits' })
    .regex(/^\d+$/, { message: 'OTP must contain only numbers' }),
});

type Verify2FASchemaType = z.infer<typeof verify2FASchema>;

function Verify2FAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<Verify2FASchemaType>({
    resolver: zodResolver(verify2FASchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    if (!email) {
      // Redirect to signin if no email provided
      router.push('/signin');
    }
  }, [email, router]);

  async function onSubmit(values: Verify2FASchemaType) {
    if (!email) {
      setError('Email is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get device info if available
      const device = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
      const os = typeof navigator !== 'undefined' ? navigator.platform : undefined;

      const response = await verify2FA({
        email: email,
        otp: values.otp,
        device: device,
        os: os,
      });

      handleApiResponse(response, {
        onSuccess: async (data) => {
          try {
            // Fetch and store permissions after successful verification
            await fetchAndStorePermissions();
            
            // Redirect to appropriate dashboard
            handleLoginRedirect(data, router);
            
            toast.success('Two-factor authentication verified successfully');
          } catch (permError) {
            // Even if permissions fetch fails, still redirect (backend handles authorization)
            console.error('Failed to fetch permissions:', permError);
            handleLoginRedirect(data, router);
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Verification failed. Please check your code and try again.');
          setIsProcessing(false);
        },
        onValidationError: (errors, messages) => {
          setError(Array.isArray(messages) ? messages.join(', ') : messages || 'Validation error occurred');
          setIsProcessing(false);
        },
        onUnauthorized: () => {
          setError('Invalid code. Please check the 6-digit code from your authenticator app and try again.');
          setIsProcessing(false);
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setIsProcessing(false);
    }
  }

  if (!email) {
    return null;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2 pb-2">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-center">
          Two-Factor Authentication
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          Enter the 6-digit code from your authenticator app
        </p>
        <p className="text-xs text-muted-foreground text-center">
          Verifying for: <span className="font-semibold text-foreground">{email}</span>
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50">
          <AlertIcon>
            <AlertCircle className="h-4 w-4" />
          </AlertIcon>
          <AlertTitle className="text-sm">{error}</AlertTitle>
        </Alert>
      )}

      {/* Form */}
      <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-center w-full">Authentication code</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="000000"
                      className="text-center text-2xl font-mono tracking-widest h-14"
                      disabled={isProcessing}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-3 text-center leading-relaxed">
                    Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.) and enter the 6-digit code displayed.
                  </p>
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button
                type="submit"
                className="w-full h-11 text-base font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Verify & Continue
                  </>
                )}
              </Button>
            </div>
        </form>
      </Form>

      {/* Footer Links */}
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">
          Having trouble?{' '}
          <Link href="/signin" className="font-semibold text-primary hover:text-primary/80 transition-colors">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <Verify2FAContent />
    </Suspense>
  );
}

