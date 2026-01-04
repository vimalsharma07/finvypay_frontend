'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Eye, EyeOff, Mail, UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { register, verifyRegistrationOtp } from '@/lib/services/auth';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
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
import { getSignupSchema, SignupSchemaType } from '../forms/signup-schema';
import { z } from 'zod';
import { useResendOtp } from '@/hooks/use-resend-otp';

// OTP verification schema
const otpSchema = z.object({
  otp: z
    .string()
    .min(1, { message: 'OTP is required' })
    .refine((val) => val.length === 6, { message: 'OTP must be exactly 6 digits' })
    .refine((val) => /^\d{6}$/.test(val), { message: 'OTP must contain only numbers' }),
});

type OtpSchemaType = z.infer<typeof otpSchema>;

export function SignupContent() {
  const router = useRouter();
  const [step, setStep] = useState<'register' | 'verify'>('register');
  const [registeredEmail, setRegisteredEmail] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState<string>('');

  // Resend OTP hook
  const {
    resendOtp,
    isResending,
    cooldownRemaining,
    canResend,
  } = useResendOtp({
    email: registeredEmail,
    onSuccess: (message) => {
      setSuccess(message);
      setError(null);
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    },
    onError: (errorMessage) => {
      setError(errorMessage);
      setSuccess(null);
    },
    cooldownSeconds: 60, // 60 seconds cooldown between resend requests
  });

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      accept: false,
    },
  });

  const otpForm = useForm<OtpSchemaType>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: '',
    },
    mode: 'onSubmit', // Only validate on submit, not on change or blur
    reValidateMode: 'onSubmit',
  });

  // Reset OTP form and value when verification step is shown
  useEffect(() => {
    if (step === 'verify') {
      // Reset OTP form and local state to ensure it's empty
      otpForm.reset({ otp: '' });
      setOtpValue('');
      
      // Small delay to ensure the component is rendered, then focus
      setTimeout(() => {
        // Try to focus the actual input element inside the OTP component
        const otpContainer = document.querySelector('[data-slot="input-otp"]');
        if (otpContainer) {
          const firstInput = otpContainer.querySelector('input') as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
          }
        }
      }, 150);
    }
  }, [step, otpForm]);

  // Sync otpValue with form field value
  useEffect(() => {
    if (otpValue && otpValue.length <= 6) {
      otpForm.setValue('otp', otpValue, { shouldValidate: false });
      // Clear errors when user is typing
      if (otpValue.length > 0) {
        otpForm.clearErrors('otp');
      }
    }
  }, [otpValue, otpForm]);

  // Step 1: Register Merchant
  async function handleRegister(values: SignupSchemaType) {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await register({
        email: values.email,
        name: values.name,
        password: values.password,
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          setRegisteredEmail(values.email);
          // Reset OTP form when moving to verify step
          otpForm.reset({ otp: '' });
          setStep('verify');
          setSuccess(data?.message || 'Registration successful! Please verify the OTP sent to your email.');
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Registration failed. Please try again.');
        },
        onValidationError: (errors, messages) => {
          setError(Array.isArray(messages) ? messages.join(', ') : messages || 'Validation error occurred');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(values: OtpSchemaType) {
    // Use otpValue if form value is not available or doesn't match
    const otpToVerify = otpValue.length === 6 ? otpValue : values.otp;
    
    // Validate OTP length before proceeding
    if (otpToVerify.length !== 6) {
      setError('Please enter a valid 6-digit OTP.');
      otpForm.setError('otp', { message: 'OTP must be exactly 6 digits' });
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await verifyRegistrationOtp({
        email: registeredEmail,
        otp: otpToVerify,
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          setSuccess(data?.message || 'Email verified successfully! Your merchant account is now activated.');
          
          // Redirect to signin after 2 seconds
          setTimeout(() => {
            router.push('/signin');
          }, 2000);
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'OTP verification failed. Please check the code and try again.');
        },
        onValidationError: (errors, messages) => {
          setError(Array.isArray(messages) ? messages.join(', ') : messages || 'Validation error occurred');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }

  // OTP Verification Step
  if (step === 'verify') {
    return (
      <Suspense>
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
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
                {registeredEmail}
              </p>
            </div>

            {success && (
              <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
                <AlertIcon>
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </AlertIcon>
                <AlertTitle className="text-sm text-green-800 dark:text-green-200">{success}</AlertTitle>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="border-destructive/50" onClose={() => setError(null)}>
                <AlertIcon>
                  <AlertCircle className="h-4 w-4" />
                </AlertIcon>
                <AlertTitle className="text-sm">{error}</AlertTitle>
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
                        onClick={resendOtp}
                        disabled={!canResend}
                        className={`font-semibold transition-colors ${
                          canResend
                            ? 'text-primary hover:text-primary/80 cursor-pointer'
                            : 'text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                      >
                        {isResending ? (
                          <>
                            <LoaderCircleIcon className="inline size-3 animate-spin mr-1" />
                            Sending...
                          </>
                        ) : cooldownRemaining > 0 ? (
                          `Resend code (${cooldownRemaining}s)`
                        ) : (
                          'Resend code'
                        )}
                      </button>
                    </p>
                  </FormItem>
                );
              }}
            />

            <div className="flex flex-col gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={isProcessing || otpValue.length !== 6}
                onClick={async (e) => {
                  if (otpValue.length === 6) {
                    otpForm.setValue('otp', otpValue, { shouldValidate: true });
                  }
                }}
                className="w-full h-11 text-base font-semibold"
              >
                {isProcessing ? (
                  <>
                    <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify & Continue
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('register');
                  setError(null);
                  setSuccess(null);
                }}
                className="w-full h-11"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Registration
              </Button>
            </div>
          </form>
        </Form>
      </Suspense>
    );
  }

  // Registration Step
  return (
    <Suspense>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister)}
          className="block w-full space-y-6"
        >
          <div className="space-y-2 pb-2">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-center">
              Create Account
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Get started with your free account
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

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Full name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="John Doe" 
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
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <div className="relative">
                    <Input
                      placeholder="Create a password"
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

            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm password</FormLabel>
                  <div className="relative">
                    <Input
                      type={passwordConfirmationVisible ? 'text' : 'password'}
                      className="h-11 pr-10"
                      placeholder="Confirm your password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      size="sm"
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
          </div>

          <div className="flex items-start space-x-2">
            <FormField
              control={form.control}
              name="accept"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-start gap-2.5">
                      <Checkbox
                        id="accept"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label
                        htmlFor="accept"
                        className="text-sm leading-relaxed text-muted-foreground cursor-pointer select-none"
                      >
                        I agree to the{' '}
                        <Link
                          href="/privacy-policy"
                          target="_blank"
                          className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {success && (
            <Alert className="bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
              <AlertIcon>
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400" />
              </AlertIcon>
              <AlertTitle className="text-sm text-green-800 dark:text-green-200">{success}</AlertTitle>
            </Alert>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              type="submit" 
              disabled={isProcessing}
              className="w-full h-11 text-base font-semibold"
            >
              {isProcessing ? (
                <>
                  <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </div>

          <div className="pt-2">
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/signin"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </Suspense>
  );
}

