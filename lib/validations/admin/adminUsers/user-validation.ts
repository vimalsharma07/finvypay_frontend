import { z } from 'zod';
import { getPasswordSchema } from '@/app/(auth)/forms/password-schema';

/**
 * Validation schema for creating a new user
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
  role: z
    .string()
    .min(1, { message: 'Role is required.' })
    .refine((val) => ['admin', 'user', 'affiliate'].includes(val), {
      message: 'Role must be one of: admin, user, or affiliate.',
    }),
  roleId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
});

export type CreateUserSchemaType = z.infer<typeof createUserSchema>;

/**
 * Validation schema for updating a user
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
  role: z
    .string()
    .min(1, { message: 'Role is required.' })
    .refine((val) => ['admin', 'user', 'affiliate'].includes(val), {
      message: 'Role must be one of: admin, user, or affiliate.',
    }),
  isBlocked: z.boolean().optional(),
  isDeleted: z.boolean().optional(),
});

export type UpdateUserSchemaType = z.infer<typeof updateUserSchema>;
