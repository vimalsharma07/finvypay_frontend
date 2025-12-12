'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff, Mail } from 'lucide-react';
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

export default function Page() {
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
            className="block w-full space-y-5"
          >
            <div className="space-y-1.5 pb-3">
              <h1 className="text-2xl font-semibold tracking-tight text-center">
                Verify Your Email
              </h1>
              <p className="text-sm text-muted-foreground text-center">
                We've sent a 6-digit OTP to <span className="font-semibold">{registeredEmail}</span>
              </p>
            </div>

            {success && (
              <Alert>
                <AlertIcon>
                  <Check />
                </AlertIcon>
                <AlertTitle>{success}</AlertTitle>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" onClose={() => setError(null)}>
                <AlertIcon>
                  <AlertCircle />
                </AlertIcon>
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}

            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => {
                // Use otpValue as the source of truth, sync with form field
                const currentValue = otpValue || '';
                
                // Sync form field value when otpValue changes
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
                          // Only allow numeric values, limit to 6 digits
                          const numericValue = value.replace(/\D/g, '').slice(0, 6);
                          setOtpValue(numericValue);
                          // Update form field immediately without validation
                          field.onChange(numericValue, { shouldValidate: false });
                          // Clear validation errors when typing
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
                      Didn't receive the code?{' '}
                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={!canResend}
                        className={`font-semibold transition-colors ${
                          canResend
                            ? 'text-primary hover:underline cursor-pointer'
                            : 'text-muted-foreground cursor-not-allowed opacity-50'
                        }`}
                      >
                        {isResending ? (
                          <>
                            <LoaderCircleIcon className="inline size-3 animate-spin mr-1" />
                            Sending...
                          </>
                        ) : cooldownRemaining > 0 ? (
                          `Resend OTP (${cooldownRemaining}s)`
                        ) : (
                          'Resend OTP'
                        )}
                      </button>
                    </p>
                  </FormItem>
                );
              }}
            />

            <div className="flex flex-col gap-2.5">
              <Button 
                type="submit" 
                disabled={isProcessing || otpValue.length !== 6}
                onClick={async (e) => {
                  // Ensure form value is set before validation
                  if (otpValue.length === 6) {
                    otpForm.setValue('otp', otpValue, { shouldValidate: true });
                  }
                }}
              >
                {isProcessing ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : null}
                Verify OTP
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStep('register');
                  setError(null);
                  setSuccess(null);
                }}
              >
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
          className="block w-full space-y-5"
        >
          <div className="space-y-1.5 pb-3">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              Merchant Sign Up
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              Create your merchant account
            </p>
          </div>


          {error && (
            <Alert variant="destructive" onClose={() => setError(null)}>
              <AlertIcon>
                <AlertCircle />
              </AlertIcon>
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
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
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    type={passwordVisible ? 'text' : 'password'}
                    {...field}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    mode="icon"
                    size="sm"
                    onClick={() => setPasswordVisible(!passwordVisible)}
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

          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <Input
                    type={passwordConfirmationVisible ? 'text' : 'password'}
                    {...field}
                    placeholder="Confirm your password"
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
                    className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                    aria-label={
                      passwordConfirmationVisible
                        ? 'Hide password confirmation'
                        : 'Show password confirmation'
                    }
                  >
                    {passwordConfirmationVisible ? (
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
              name="accept"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="flex items-center gap-2.5">
                      <Checkbox
                        id="accept"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                      <label
                        htmlFor="accept"
                        className="text-sm leading-none text-muted-foreground"
                      >
                        I agree to the
                      </label>
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="-ms-0.5 text-sm font-semibold text-foreground hover:text-primary"
                      >
                        Privacy Policy
                      </Link>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {success && (
            <Alert>
              <AlertIcon>
                <Mail />
              </AlertIcon>
              <AlertTitle>{success}</AlertTitle>
            </Alert>
          )}

          <div className="flex flex-col gap-2.5">
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : null}
              Create Account
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Already have a merchant account?{' '}
            <Link
              href="/signin"
              className="text-sm font-semibold text-foreground hover:text-primary"
            >
              Sign In
            </Link>
          </p>
        </form>
      </Form>
    </Suspense>
  );
}
