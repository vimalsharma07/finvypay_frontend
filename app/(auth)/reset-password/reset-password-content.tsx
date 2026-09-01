'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircleIcon,
  Mail,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { resetPassword } from '@/lib/services/auth';
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { RecaptchaPopover } from '@/components/common/recaptcha-popover';
import { isAuthenticated } from '@/lib/auth-storage';
import { getRedirectPathByRole, getUserRole } from '@/lib/utils/menu-utils';
import { useForgotPassword } from '@/hooks/use-forgot-password';
import {
  forgotPasswordEmailSchema,
  ForgotPasswordEmailSchemaType,
  resetPasswordWithOtpSchema,
  ResetPasswordWithOtpSchemaType,
} from '../forms/reset-password-schema';

type Step = 'email' | 'reset';

export function ResetPasswordContent() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const {
    sendOtp,
    isProcessing,
    cooldownRemaining,
    canSend,
    error: otpError,
    success: otpSuccess,
  } = useForgotPassword({ cooldownSeconds: 60 });

  useEffect(() => {
    if (isAuthenticated()) {
      const userRole = getUserRole();
      const redirectPath = getRedirectPathByRole(userRole);
      router.replace(redirectPath);
      return;
    }
    setIsCheckingAuth(false);
  }, [router]);

  useEffect(() => {
    if (otpSuccess && step === 'email') {
      setStep('reset');
    }
  }, [otpSuccess, step]);

  const emailForm = useForm<ForgotPasswordEmailSchemaType>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetPasswordWithOtpSchemaType>({
    resolver: zodResolver(resetPasswordWithOtpSchema),
    defaultValues: {
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await emailForm.trigger();
    if (!result) return;
    setShowRecaptcha(true);
  };

  const handleVerifiedEmailSubmit = async () => {
    const values = emailForm.getValues();
    setEmail(values.email.trim());
    setShowRecaptcha(false);
    await sendOtp(values.email.trim());
  };

  const handleResendOtp = async () => {
    if (!email || cooldownRemaining > 0) return;
    await sendOtp(email);
  };

  const handleResetSubmit = async (values: ResetPasswordWithOtpSchemaType) => {
    setIsResetting(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      const response = await resetPassword({
        email,
        otp: values.otp,
        newPassword: values.newPassword,
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          setResetSuccess(data?.message || 'Password reset successful!');
          setTimeout(() => router.push('/signin'), 3000);
        },
        onError: (errorMessage) => {
          setResetError(errorMessage || 'Failed to reset password. Please try again.');
        },
      });
    } catch (error) {
      setResetError(error instanceof Error ? error.message : 'Failed to reset password.');
    } finally {
      setIsResetting(false);
    }
  };

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
      {step === 'email' ? (
        <Form {...emailForm}>
          <form onSubmit={handleEmailSubmit} className="block w-full space-y-6">
            <div className="space-y-2 pb-2">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-center">Reset Password</h1>
              <p className="text-sm text-muted-foreground text-center">
                Enter your email to receive a verification code
              </p>
            </div>

            {otpError && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertIcon>
                  <AlertCircle className="h-4 w-4" />
                </AlertIcon>
                <AlertTitle className="text-sm">{otpError}</AlertTitle>
              </Alert>
            )}

            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      disabled={isProcessing}
                      className="h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {cooldownRemaining > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Please wait{' '}
                <span className="font-semibold text-foreground">{cooldownRemaining}</span>{' '}
                seconds before requesting another code.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <RecaptchaPopover
                open={showRecaptcha}
                onOpenChange={(open) => {
                  if (!open) setShowRecaptcha(false);
                }}
                onVerify={handleVerifiedEmailSubmit}
                trigger={
                  <Button
                    type="submit"
                    disabled={isProcessing || !canSend}
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
                        Send Verification Code
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
      ) : (
        <Form {...resetForm}>
          <form
            onSubmit={resetForm.handleSubmit(handleResetSubmit)}
            className="block w-full space-y-6"
          >
            <div className="space-y-2 pb-2">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <KeyRound className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-center">Reset Password</h1>
              <p className="text-sm text-muted-foreground text-center">
                Enter the 6-digit code sent to
              </p>
              <p className="text-sm font-semibold text-center text-foreground">{email}</p>
            </div>

            {resetError && (
              <Alert variant="destructive" className="border-destructive/50">
                <AlertIcon>
                  <AlertCircle className="h-4 w-4" />
                </AlertIcon>
                <AlertTitle className="text-sm">{resetError}</AlertTitle>
              </Alert>
            )}

            {resetSuccess && (
              <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
                <AlertIcon>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </AlertIcon>
                <AlertTitle className="text-sm text-green-800 dark:text-green-200">
                  {resetSuccess} Redirecting to sign in...
                </AlertTitle>
              </Alert>
            )}

            <FormField
              control={resetForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-center w-full">
                    Verification code
                  </FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        pattern="[0-9]*"
                        value={otpValue}
                        disabled={!!resetSuccess || isResetting}
                        onChange={(value) => {
                          const numericValue = value.replace(/\D/g, '').slice(0, 6);
                          setOtpValue(numericValue);
                          field.onChange(numericValue);
                          resetForm.clearErrors('otp');
                        }}
                      >
                        <InputOTPGroup className="gap-2">
                          {[0, 1, 2, 3, 4, 5].map((index) => (
                            <InputOTPSlot
                              key={index}
                              index={index}
                              className="h-12 w-12 text-lg font-semibold"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldownRemaining > 0 || isProcessing || !!resetSuccess}
                className="text-sm text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
              >
                {cooldownRemaining > 0
                  ? `Resend code in ${cooldownRemaining}s`
                  : 'Resend verification code'}
              </button>
            </div>

            <FormField
              control={resetForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">New password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisible ? 'text' : 'password'}
                        placeholder="Enter new password"
                        disabled={!!resetSuccess || isResetting}
                        className="h-11 pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute end-0 top-1/2 -translate-y-1/2 h-8 w-8 me-1.5"
                      >
                        {passwordVisible ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={resetForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={confirmPasswordVisible ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        disabled={!!resetSuccess || isResetting}
                        className="h-11 pr-10"
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        mode="icon"
                        size="sm"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                        className="absolute end-0 top-1/2 -translate-y-1/2 h-8 w-8 me-1.5"
                      >
                        {confirmPasswordVisible ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-3 pt-2">
              {!resetSuccess && (
                <>
                  <Button
                    type="submit"
                    disabled={isResetting || otpValue.length !== 6}
                    className="w-full h-11 text-base font-semibold"
                  >
                    {isResetting ? (
                      <>
                        <LoaderCircleIcon className="size-4 animate-spin mr-1" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Reset Password
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('email')}
                    disabled={isResetting}
                    className="w-full h-11"
                  >
                    Back
                  </Button>
                </>
              )}
            </div>
          </form>
        </Form>
      )}
    </Suspense>
  );
}
