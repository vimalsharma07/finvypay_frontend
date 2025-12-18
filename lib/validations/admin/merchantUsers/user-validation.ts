import { z } from 'zod';
import { getPasswordSchema } from '@/app/(auth)/forms/password-schema';

/**
 * Validation schema for creating a new merchant user
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .min(1, { message: 'Name is required.' }),
  password: getPasswordSchema(),
  roleId: z
    .string()
    .min(1, { message: 'Role is required.' })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Role ID must be a valid positive number',
    }),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;

/**
 * Validation schema for updating a merchant user
 */
export const updateUserSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required.' })
    .email({ message: 'Please enter a valid email address.' }),
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .min(1, { message: 'Name is required.' }),
  roleId: z
    .string()
    .min(1, { message: 'Role is required.' })
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: 'Role ID must be a valid positive number',
    }),
  isBlocked: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
