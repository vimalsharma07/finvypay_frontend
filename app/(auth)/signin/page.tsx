'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { LoaderCircleIcon } from 'lucide-react';
import { Icons } from '@/components/common/icons';
import { getSigninSchema, SigninSchemaType } from '../forms/signin-schema';
import { login, validateUser } from '@/lib/services/auth-api';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { useGoogleOAuth } from '@/hooks/use-google-oauth';
import { ForgotPasswordDialog } from './components/forgot-password-dialog';
import { useOtpSignin } from '@/hooks/use-otp-signin';

// OTP verification schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(1, { message: 'OTP is required' })
    .refine((val) => val.length === 6, { message: 'OTP must be exactly 6 digits' })
    .refine((val) => /^\d{6}$/.test(val), { message: 'OTP must contain only numbers' }),
});

type OtpSchemaType = z.infer<typeof otpSchema>;

export default function Page() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [otpValue, setOtpValue] = useState<string>('');
  const [otpEmail, setOtpEmail] = useState<string>('');

  // Google OAuth hook
  const {
    signInWithGoogle,
    isProcessing: isGoogleProcessing,
    error: googleError,
  } = useGoogleOAuth({
    onSuccess: () => {
      // Redirect to home page on successful Google login
      router.push('/');
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    },
    autoLoad: true, // Auto-load Google script
  });

  // OTP Signin hook
  const {
    sendOtp,
    verifyOtp,
    isSendingOtp,
    isVerifyingOtp,
    error: otpError,
    success: otpSuccess,
    otpSent,
    resetState: resetOtpState,
  } = useOtpSignin({
    onSuccess: () => {
      // Redirect to home page on successful OTP login
      router.push('/');
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    },
  });

  // Handle resend OTP for OTP signin (use sendOtp from hook)
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            if (resendTimerRef.current) {
              clearInterval(resendTimerRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
        resendTimerRef.current = null;
      }
    }

    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !otpEmail) return;
    setResendCooldown(60);
    await sendOtp(otpEmail);
  };

  // Password login form
  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // OTP form (for email input step)
  const otpEmailForm = useForm<{ email: string }>({
    resolver: zodResolver(z.object({
      email: z.string().email({ message: 'Please enter a valid email address.' }).min(1, { message: 'Email is required.' }),
    })),
    defaultValues: {
      email: '',
    },
  });

  // OTP verification form
  const otpForm = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Reset OTP form when switching to OTP method
  useEffect(() => {
    if (loginMethod === 'otp') {
      otpEmailForm.reset({ email: '' });
      otpForm.reset({ otp: '' });
      setOtpValue('');
      setOtpEmail('');
      resetOtpState();
      setError(null);
    }
  }, [loginMethod, otpEmailForm, otpForm, resetOtpState]);

  // Reset OTP form when OTP is sent
  useEffect(() => {
    if (otpSent) {
      otpForm.reset({ otp: '' });
      setOtpValue('');
    }
  }, [otpSent, otpForm]);

  async function onSubmit(values: SigninSchemaType) {
    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Validate user credentials before login
      const validationResponse = await validateUser({
        email: values.email,
        password: values.password,
      });

      if (!validationResponse.data?.success) {
        const errorMessage = validationResponse.error || 'User validation failed. Please check your credentials.';
        setError(errorMessage);
        setIsProcessing(false);
        return;
      }

      // Step 2: Proceed with login after successful validation
      const response = await login({
        email: values.email,
        password: values.password,
      });

      handleApiResponse(response, {
        onSuccess: () => {
          // Redirect to home page on success
          router.push('/');
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Login failed. Please check your credentials and try again.');
        },
        onValidationError: (errors, messages) => {
          setError(Array.isArray(messages) ? messages.join(', ') : messages || 'Validation error occurred');
        },
        onUnauthorized: () => {
          setError('Invalid credentials. Please check your email and password.');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    }
  }

  // Handle OTP email submission
  async function onOtpEmailSubmit(values: { email: string }) {
    setOtpEmail(values.email);
    await sendOtp(values.email);
  }

  // Handle OTP verification
  async function onOtpVerifySubmit(values: OtpSchemaType) {
    if (!otpEmail) {
      setError('Email is required. Please go back and enter your email.');
      return;
    }
    await verifyOtp(otpEmail, values.otp);
  }

  return (
    <>
      {/* Password Login Form */}
      {loginMethod === 'password' && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="block w-full space-y-5"
          >
        <div className="space-y-1.5 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Merchant Login
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to your merchant account
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <Button
            variant="outline"
            type="button"
            onClick={signInWithGoogle}
            disabled={isGoogleProcessing || isProcessing}
          >
            {isGoogleProcessing ? (
              <LoaderCircleIcon className="size-4 animate-spin mr-2" />
            ) : (
              <Icons.googleColorful className="size-5! opacity-100! mr-2" />
            )}
            {isGoogleProcessing ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </div>

        <div className="relative py-1.5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {(error || googleError) && (
          <Alert variant="destructive">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error || googleError}</AlertTitle>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Input
                  placeholder="Enter your password"
                  type={passwordVisible ? 'text' : 'password'} // Toggle input type
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  onClick={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
                  className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                  aria-label={
                    passwordVisible ? 'Hide password' : 'Show password'
                  }
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <>
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm leading-none text-muted-foreground"
                >
                  Remember me
                </label>
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? <LoaderCircleIcon className="size-4 animate-spin" /> : null}
            Continue
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have a merchant account?{' '}
          <Link
            href="/signup"
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Create Account
          </Link>
        </p>
      </form>
        </Form>
      )}

      {/* OTP Login Form */}
      {loginMethod === 'otp' && !otpSent && (
      <Form {...otpEmailForm}>
        <form
          onSubmit={otpEmailForm.handleSubmit(onOtpEmailSubmit)}
          className="block w-full space-y-5"
        >
          <div className="space-y-1.5 pb-3">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Merchant Login
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Sign in to your merchant account
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <Button
              variant="outline"
              type="button"
              onClick={signInWithGoogle}
              disabled={isGoogleProcessing || isSendingOtp}
            >
              {isGoogleProcessing ? (
                <LoaderCircleIcon className="size-4 animate-spin mr-2" />
              ) : (
                <Icons.googleColorful className="size-5! opacity-100! mr-2" />
              )}
              {isGoogleProcessing ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>

          <div className="relative py-1.5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {(error || googleError || otpError) && (
            <Alert variant="destructive">
              <AlertIcon>
                <AlertCircle />
              </AlertIcon>
              <AlertTitle>{error || googleError || otpError}</AlertTitle>
            </Alert>
          )}

          {otpSuccess && (
            <Alert variant="success" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <AlertIcon>
                <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </AlertIcon>
              <AlertTitle className="text-green-800 dark:text-green-200">
                {otpSuccess}
              </AlertTitle>
            </Alert>
          )}

          <FormField
            control={otpEmailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-2.5">
            <Button type="submit" disabled={isSendingOtp}>
              {isSendingOtp ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Don&apos;t have a merchant account?{' '}
            <Link
              href="/signup"
              className="text-sm font-semibold text-foreground hover:text-primary"
            >
              Create Account
            </Link>
          </p>
        </form>
      </Form>
    )}

    {/* OTP Verification Form */}
    {loginMethod === 'otp' && otpSent && (
      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(onOtpVerifySubmit)}
          className="block w-full space-y-5"
        >
          <div className="space-y-1.5 pb-3">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Enter OTP
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              We&apos;ve sent a 6-digit code to {otpEmail}
            </p>
          </div>

          {(error || otpError) && (
            <Alert variant="destructive">
              <AlertIcon>
                <AlertCircle />
              </AlertIcon>
              <AlertTitle>{error || otpError}</AlertTitle>
            </Alert>
          )}

          <FormField
            control={otpForm.control}
            name="otp"
            render={({ field }) => {
              const currentValue = otpValue || '';
              
              if (field.value !== currentValue) {
                field.onChange(currentValue);
              }
              
              return (
                <FormItem>
                  <FormLabel>Enter OTP</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      pattern="[0-9]*"
                      value={currentValue}
                      onChange={(value) => {
                        const numericValue = value.replace(/\D/g, '').slice(0, 6);
                        setOtpValue(numericValue);
                        field.onChange(numericValue, { shouldValidate: false });
                        otpForm.clearErrors('otp');
                        setError(null);
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground mt-2">
                    Didn&apos;t receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isSendingOtp || !otpEmail}
                      className="font-semibold text-foreground hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSendingOtp
                        ? 'Sending...'
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend OTP'}
                    </button>
                  </p>
                </FormItem>
              );
            }}
          />

          <div className="flex flex-col gap-2.5">
            <Button
              type="submit"
              disabled={isVerifyingOtp || otpValue.length !== 6}
              onClick={() => {
                // Explicitly set form value before submission
                otpForm.setValue('otp', otpValue, { shouldValidate: true });
              }}
            >
              {isVerifyingOtp ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetOtpState();
                setOtpValue('');
                setOtpEmail('');
                otpEmailForm.reset({ email: '' });
                otpForm.reset({ otp: '' });
                setError(null);
              }}
            >
              Back to Email
            </Button>
          </div>
        </form>
      </Form>
    )}

    {/* Login Method Toggle */}
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        type="button"
        onClick={() => {
          setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
          setError(null);
          form.reset();
          otpEmailForm.reset();
          otpForm.reset();
          setOtpValue('');
          setOtpEmail('');
          resetOtpState();
        }}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {loginMethod === 'password'
          ? 'Sign in with OTP instead'
          : 'Sign in with password instead'}
      </button>
    </div>

    {/* Forgot Password Dialog */}
    <ForgotPasswordDialog
      open={forgotPasswordOpen}
      onOpenChange={setForgotPasswordOpen}
      initialEmail={form.watch('email')}
    />
  </>
  );
}
