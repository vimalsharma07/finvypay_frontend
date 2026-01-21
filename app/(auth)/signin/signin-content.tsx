'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, LogIn, Mail, CheckCircle, ArrowLeft } from 'lucide-react';
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
import { login, validateUser } from '@/lib/services/auth';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { useGoogleOAuth } from '@/hooks/use-google-oauth';
import { ForgotPasswordDialog } from './components/forgot-password-dialog';
import { useOtpSignin } from '@/hooks/use-otp-signin';
import { handleLoginRedirect, getRedirectPathByRole } from '@/lib/utils/menu-utils';
import { isAuthenticated } from '@/lib/auth-storage';
import { fetchAndStorePermissions } from '@/lib/utils/auth-helpers';

// OTP verification schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(1, { message: 'OTP is required' })
    .refine((val) => val.length === 6, { message: 'OTP must be exactly 6 digits' })
    .refine((val) => /^\d{6}$/.test(val), { message: 'OTP must contain only numbers' }),
});

type OtpSchemaType = z.infer<typeof otpSchema>;

export function SigninContent() {
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
    onSuccess: async (data) => {
      try {
        // Fetch and store permissions after successful Google login
        await fetchAndStorePermissions();
        handleLoginRedirect(data, router);
      } catch (permError) {
        // Even if permissions fetch fails, still redirect (backend handles authorization)
        console.error('Failed to fetch permissions:', permError);
        handleLoginRedirect(data, router);
      }
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
    onSuccess: async (data) => {
      try {
        // Fetch and store permissions after successful OTP verification
        await fetchAndStorePermissions();
        handleLoginRedirect(data, router);
      } catch (permError) {
        // Even if permissions fetch fails, still redirect (backend handles authorization)
        console.error('Failed to fetch permissions:', permError);
        handleLoginRedirect(data, router);
      }
    },
    onError: (errorMessage) => {
      setError(errorMessage);
    },
  });

  // Handle resend OTP for OTP signin (use sendOtp from hook)
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const redirectPath = getRedirectPathByRole();
      router.replace(redirectPath);
    }
  }, [router]);

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
        onSuccess: async (data) => {
          try {
            // Check if 2FA is required
            if (data?.requires2FA === true) {
              // Redirect to 2FA verification page with email
              router.push(`/2fa-verify?email=${encodeURIComponent(values.email)}`);
              setIsProcessing(false);
              return;
            }

            // Step 3: Fetch and store permissions after successful login
            await fetchAndStorePermissions();
            
            // Step 4: Redirect to appropriate dashboard
            handleLoginRedirect(data, router);
          } catch (permError) {
            // Even if permissions fetch fails, still redirect (backend handles authorization)
            console.error('Failed to fetch permissions:', permError);
            handleLoginRedirect(data, router);
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Login failed. Please check your credentials and try again.');
          setIsProcessing(false);
        },
        onValidationError: (errors, messages) => {
          setError(Array.isArray(messages) ? messages.join(', ') : messages || 'Validation error occurred');
          setIsProcessing(false);
        },
        onUnauthorized: () => {
          setError('Invalid credentials. Please check your email and password.');
          setIsProcessing(false);
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
            className="block w-full space-y-6"
          >
        <div className="space-y-2 pb-2">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            Welcome Back
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            Sign in to your account to continue
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          <Button
            variant="outline"
            type="button"
            onClick={signInWithGoogle}
            disabled={isGoogleProcessing || isProcessing}
            className="w-full h-11 border-2 hover:bg-muted/50 transition-all"
          >
            {isGoogleProcessing ? (
              <LoaderCircleIcon className="size-4 animate-spin mr-1" />
            ) : (
              <Icons.googleColorful className="size-5! opacity-100! mr-1" />
            )}
            {isGoogleProcessing ? 'Signing in...' : 'Sign in with Google'}
          </Button>
        </div>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wider">
            <span className="bg-card px-3 text-muted-foreground font-medium">or continue with</span>
          </div>
        </div>

        {(error || googleError) && (
          <Alert variant="destructive" className="border-destructive/50">
            <AlertIcon>
              <AlertCircle className="h-4 w-4" />
            </AlertIcon>
            <AlertTitle className="text-sm">{error || googleError}</AlertTitle>
          </Alert>
        )}

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="name@example.com" 
                    className="h-11"
                    {...field} 
                  />
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
                <div className="flex justify-between items-center gap-2.5 mb-1.5">
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(true)}
                    className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    type={passwordVisible ? 'text' : 'password'}
                    className="h-11 pr-10"
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    mode="icon"
                    size="sm"
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
        </div>

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm leading-none text-muted-foreground cursor-pointer select-none"
                >
                  Remember me for 30 days
                </label>
              </div>
            )}
          />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button 
            type="submit" 
            disabled={isProcessing}
            className="w-full h-11 text-base font-semibold"
          >
            {isProcessing ? (
              <>
                <LoaderCircleIcon className="size-4 animate-spin mr-1" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1" />
                Sign in
              </>
            )}
          </Button>
        </div>

        <div className="pt-2">
          <p className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </form>
        </Form>
      )}

      {/* OTP Login Form */}
      {loginMethod === 'otp' && !otpSent && (
      <Form {...otpEmailForm}>
        <form
          onSubmit={otpEmailForm.handleSubmit(onOtpEmailSubmit)}
          className="block w-full space-y-6"
        >
          <div className="space-y-2 pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-center">
              Sign in with OTP
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              We&apos;ll send you a one-time password
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <Button
              variant="outline"
              type="button"
              onClick={signInWithGoogle}
              disabled={isGoogleProcessing || isSendingOtp}
              className="w-full h-11 border-2 hover:bg-muted/50 transition-all"
            >
              {isGoogleProcessing ? (
                <LoaderCircleIcon className="size-4 animate-spin mr-1" />
              ) : (
                <Icons.googleColorful className="size-5! opacity-100! mr-1" />
              )}
              {isGoogleProcessing ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="bg-card px-3 text-muted-foreground font-medium">or continue with</span>
            </div>
          </div>

          {(error || googleError || otpError) && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle className="text-sm">{error || googleError || otpError}</AlertTitle>
            </Alert>
          )}

          {otpSuccess && (
            <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
              <AlertIcon>
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </AlertIcon>
              <AlertTitle className="text-sm text-green-800 dark:text-green-200">
                {otpSuccess}
              </AlertTitle>
            </Alert>
          )}

          <FormField
            control={otpEmailForm.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Email address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="name@example.com" 
                    type="email" 
                    className="h-11"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit" 
              disabled={isSendingOtp}
              className="w-full h-11 text-base font-semibold"
            >
              {isSendingOtp ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin mr-1" />
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Send OTP
                </>
              )}
            </Button>
          </div>

          <div className="pt-2">
            <p className="text-sm text-center text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </Form>
    )}

    {/* OTP Verification Form */}
    {loginMethod === 'otp' && otpSent && (
      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(onOtpVerifySubmit)}
          className="block w-full space-y-6"
        >
          <div className="space-y-2 pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-center">
              Verify Your Email
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              We&apos;ve sent a 6-digit code to
            </p>
            <p className="text-sm font-semibold text-center text-foreground">
              {otpEmail}
            </p>
          </div>

          {(error || otpError) && (
            <Alert variant="destructive" className="border-destructive/50">
              <AlertIcon>
                <AlertCircle className="h-4 w-4" />
              </AlertIcon>
              <AlertTitle className="text-sm">{error || otpError}</AlertTitle>
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
                  <FormLabel className="text-sm font-medium text-center w-full">Enter verification code</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
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
                        <InputOTPGroup className="gap-2">
                          <InputOTPSlot index={0} className="h-12 w-12 text-lg font-semibold" />
                          <InputOTPSlot index={1} className="h-12 w-12 text-lg font-semibold" />
                          <InputOTPSlot index={2} className="h-12 w-12 text-lg font-semibold" />
                          <InputOTPSlot index={3} className="h-12 w-12 text-lg font-semibold" />
                          <InputOTPSlot index={4} className="h-12 w-12 text-lg font-semibold" />
                          <InputOTPSlot index={5} className="h-12 w-12 text-lg font-semibold" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage className="text-center" />
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Didn&apos;t receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isSendingOtp || !otpEmail}
                      className="font-semibold text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSendingOtp
                        ? 'Sending...'
                        : resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend code'}
                    </button>
                  </p>
                </FormItem>
              );
            }}
          />

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="submit"
              disabled={isVerifyingOtp || otpValue.length !== 6}
              onClick={() => {
                otpForm.setValue('otp', otpValue, { shouldValidate: true });
              }}
              className="w-full h-11 text-base font-semibold"
            >
              {isVerifyingOtp ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin mr-1" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verify & Continue
                </>
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
              className="w-full h-11"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Email
            </Button>
          </div>
        </form>
      </Form>
    )}

    {/* Login Method Toggle */}
    <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border/50">
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
        className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
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

