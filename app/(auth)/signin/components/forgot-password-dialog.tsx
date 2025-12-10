// app/(auth)/signin/components/forgot-password-dialog.tsx
// Advanced reusable forgot password dialog component

'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, LoaderCircleIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useForgotPassword } from '@/hooks/use-forgot-password';

// Zod schema for forgot password form
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialEmail?: string; // Pre-fill email if provided
}

/**
 * Forgot Password Dialog Component
 * 
 * A reusable, advanced dialog component for handling password reset requests.
 * Features:
 * - Email validation
 * - Rate limiting with cooldown timer
 * - Success/error state management
 * - Auto-close on success (optional)
 * - Pre-fill email support
 * 
 * @example
 * ```tsx
 * <ForgotPasswordDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   initialEmail="user@example.com"
 * />
 * ```
 */
export function ForgotPasswordDialog({
  open,
  onOpenChange,
  initialEmail = '',
}: ForgotPasswordDialogProps) {
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  // Initialize forgot password hook
  const {
    sendResetLink,
    isProcessing,
    cooldownRemaining,
    canSend,
    error: hookError,
    success: hookSuccess,
  } = useForgotPassword({
    onSuccess: (message) => {
      setLocalSuccess(message);
      // Auto-close dialog after 3 seconds on success (optional)
      // setTimeout(() => {
      //   onOpenChange(false);
      // }, 3000);
    },
    onError: (error) => {
      // Error is handled by the hook's error state
    },
    cooldownSeconds: 60, // 60 seconds cooldown
  });

  // Initialize form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: initialEmail,
    },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  // Reset form and state when dialog opens/closes
  useEffect(() => {
    if (open) {
      // Reset form with initial email
      form.reset({
        email: initialEmail,
      });
      // Reset local success state
      setLocalSuccess(null);
    }
  }, [open, initialEmail, form]);

  // Handle form submission
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    await sendResetLink(values.email);
  };

  // Handle dialog close
  const handleClose = (newOpen: boolean) => {
    if (!newOpen && !isProcessing) {
      // Reset form and state when closing
      form.reset();
      setLocalSuccess(null);
    }
    onOpenChange(newOpen);
  };

  const displaySuccess = localSuccess || hookSuccess;
  const displayError = hookError;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password?</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Success Message */}
            {displaySuccess && (
              <Alert variant="success" className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <AlertIcon>
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                </AlertIcon>
                <AlertTitle className="text-green-800 dark:text-green-200">
                  {displaySuccess}
                </AlertTitle>
              </Alert>
            )}

            {/* Error Message */}
            {displayError && !displaySuccess && (
              <Alert variant="destructive">
                <AlertIcon>
                  <AlertCircle />
                </AlertIcon>
                <AlertTitle>{displayError}</AlertTitle>
              </Alert>
            )}

            {/* Email Input */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      type="email"
                      autoComplete="email"
                      disabled={isProcessing || !!displaySuccess}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cooldown Timer */}
            {cooldownRemaining > 0 && (
              <div className="text-sm text-muted-foreground text-center">
                Please wait {cooldownRemaining} seconds before requesting another reset link.
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                type="submit"
                disabled={isProcessing || !canSend || !!displaySuccess}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : displaySuccess ? (
                  'Reset Link Sent'
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              {/* Close Button (shown after success) */}
              {displaySuccess && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

