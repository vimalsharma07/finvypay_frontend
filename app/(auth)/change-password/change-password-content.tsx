'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { changePassword } from '@/lib/services/auth';
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
import {
  ChangePasswordSchemaType,
  getChangePasswordSchema,
} from '../forms/change-password-schema';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth-storage';
import { getRedirectPathByRole, getUserRole } from '@/lib/utils/menu-utils';

export function ChangePasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || null;

  const [verifyingToken, setVerifyingToken] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);
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

  const form = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(getChangePasswordSchema()),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    // Token will be validated when password is changed
    // No need for separate verification step
    if (token) {
      setIsValidToken(true);
    } else {
      setError('No reset token provided.');
    }
  }, [token]);

  async function onSubmit(values: ChangePasswordSchemaType) {
    setIsProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await changePassword({
        token: token || '',
        newPassword: values.newPassword,
      });

      handleApiResponse(response, {
        onSuccess: () => {
          setSuccessMessage('Password reset successful! Redirecting to login...');
          setTimeout(() => router.push('/signin'), 3000);
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Password reset failed.');
        },
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Password reset failed.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block w-full space-y-6"
      >
        <div className="space-y-2 pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Reset Password
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Enter your new password below
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

        {successMessage && (
          <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
            <AlertIcon>
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </AlertIcon>
            <AlertTitle className="text-sm text-green-800 dark:text-green-200">{successMessage}</AlertTitle>
          </Alert>
        )}

        {verifyingToken && (
          <Alert>
            <AlertIcon>
              <LoaderCircleIcon className="size-4 animate-spin" />
            </AlertIcon>
            <AlertTitle className="text-sm">Verifying token...</AlertTitle>
          </Alert>
        )}

        {isValidToken && !successMessage && !verifyingToken && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">New password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="h-11 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute end-0 top-1/2 -translate-y-1/2 h-8 w-8 me-1.5 bg-transparent! hover:bg-transparent"
                      aria-label={
                        passwordVisible ? 'Hide password' : 'Show password'
                      }
                    >
                      {passwordVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm new password</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={passwordConfirmationVisible ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="h-11 pr-10"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() =>
                        setPasswordConfirmationVisible(
                          !passwordConfirmationVisible,
                        )
                      }
                      className="absolute end-0 top-1/2 -translate-y-1/2 h-8 w-8 me-1.5 bg-transparent! hover:bg-transparent"
                      aria-label={
                        passwordConfirmationVisible
                          ? 'Hide password confirmation'
                          : 'Show password confirmation'
                      }
                    >
                      {passwordConfirmationVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-2">
              <Button 
                type="submit" 
                disabled={isProcessing} 
                className="w-full h-11 text-base font-semibold"
              >
                {isProcessing ? (
                  <>
                    <LoaderCircleIcon className="size-4 animate-spin mr-1" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4 mr-1" />
                    Reset Password
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
}

