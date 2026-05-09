'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowLeft, Check, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { forgotPassword } from '@/lib/services/auth';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoaderCircleIcon } from 'lucide-react';
import { RecaptchaPopover } from '@/components/common/recaptcha-popover';
import { isAuthenticated } from '@/lib/auth-storage';
import { getRedirectPathByRole, getUserRole } from '@/lib/utils/menu-utils';

export function ResetPasswordContent() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
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

  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email address.' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await form.trigger();
    if (!result) return;

    setShowRecaptcha(true);
  };

  const handleVerifiedSubmit = async (token: string) => {
    try {
      const values = form.getValues();

      setIsProcessing(true);
      setError(null);
      setSuccess(null);
      setShowRecaptcha(false);

      const response = await forgotPassword({ email: values.email });

      handleApiResponse(response, {
        onSuccess: (data) => {
          setSuccess(data?.message || 'Password reset link sent successfully!');
          form.reset();
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'An unexpected error occurred. Please try again.');
        },
      });
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

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
      <Form {...form}>
        <form onSubmit={handleSubmit} className="block w-full space-y-6">
          <div className="space-y-2 pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-center">
              Reset Password
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Enter your email to receive a password reset link
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-destructive/50" onClose={() => setError(null)}>
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle className="text-sm">{error}</AlertTitle>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800" onClose={() => setSuccess(null)}>
              <AlertIcon>
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </AlertIcon>
              <AlertTitle className="text-sm text-green-800 dark:text-green-200">{success}</AlertTitle>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    disabled={!!success || isProcessing}
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 pt-2">
            <RecaptchaPopover
              open={showRecaptcha}
              onOpenChange={(open) => {
                if (!open) {
                  setShowRecaptcha(false);
                }
              }}
              onVerify={handleVerifiedSubmit}
              trigger={
                <Button
                  type="submit"
                  disabled={!!success || isProcessing}
                  className="w-full h-11 text-base font-semibold"
                >
                  {isProcessing ? (
                    <>
                      <LoaderCircleIcon className="size-4 animate-spin mr-1" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-1" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              }
            />

            <Button type="button" variant="outline" className="w-full h-11" asChild>
              <Link href="/signin">
                <ArrowLeft className="size-4 mr-1" />
                Back to Sign In
              </Link>
            </Button>
          </div>
        </form>
      </Form>
    </Suspense>
  );
}

