import { z } from 'zod';
import { getPasswordSchema } from './password-schema';

export const forgotPasswordEmailSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' }),
});

export const resetPasswordWithOtpSchema = z
  .object({
    otp: z
      .string()
      .min(1, { message: 'OTP is required.' })
      .length(6, { message: 'OTP must be exactly 6 digits.' })
      .regex(/^\d+$/, { message: 'OTP must contain only numbers.' }),
    newPassword: getPasswordSchema(),
    confirmPassword: z.string().min(1, { message: 'Please confirm your password.' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export type ForgotPasswordEmailSchemaType = z.infer<typeof forgotPasswordEmailSchema>;
export type ResetPasswordWithOtpSchemaType = z.infer<typeof resetPasswordWithOtpSchema>;
