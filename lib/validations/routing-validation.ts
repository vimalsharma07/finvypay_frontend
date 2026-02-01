import { z } from 'zod';

// Routing config item schema
export const routingConfigItemSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  operator: z.enum(['>=', '<=', '>', '<', '==', '!='], {
    errorMap: () => ({ message: 'Invalid operator. Must be one of: >=, <=, >, <, ==, !=' })
  }),
  value: z.union([z.string(), z.number()]).refine((val) => {
    if (typeof val === 'string') {
      return val.trim().length > 0;
    }
    return true;
  }, 'Value is required')
});

// Create routing schema
export const createRoutingSchema = z.object({
  name: z.string()
    .min(1, 'Routing name is required')
    .max(190, 'Routing name must be less than or equal to 190 characters')
    .refine((val) => !/^\s*$/.test(val), 'Routing name cannot contain only spaces'),

  routingFor: z.enum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'WALLET'], {
    errorMap: () => ({ message: 'Invalid routing type. Must be one of: CARD, BANK_TRANSFER, CRYPTO, WALLET' })
  }),

  merchantProfileId: z.number().int().positive('Merchant profile ID must be a positive integer'),

  merchantAcquirerAccountId: z.number().int().positive('Merchant acquirer account ID must be a positive integer'),

  config: z.array(routingConfigItemSchema)
    .min(1, 'At least one configuration rule is required'),

  splitEnable: z.boolean()
});

// Type definitions
export type CreateRoutingFormData = z.infer<typeof createRoutingSchema>;
export type RoutingConfigItem = z.infer<typeof routingConfigItemSchema>;

// Create cascading schema (admin uses local state; user form uses this)
export const createCascadingSchema = z.object({
  name: z.string()
    .min(1, 'Cascading name is required')
    .max(190, 'Cascading name must be less than or equal to 190 characters')
    .refine((val) => !/^\s*$/.test(val), 'Cascading name cannot contain only spaces'),

  merchantProfileId: z.number().int().positive('Merchant profile ID must be a positive integer'),

  merchantAcquirerAccountId: z.number().int().positive('Primary acquirer account ID must be a positive integer'),

  type: z.enum(['DECLINED', 'FAILED', 'TIMEOUT', 'INSUFFICIENT_FUNDS'], {
    errorMap: () => ({ message: 'Invalid cascading type. Must be one of: DECLINED, FAILED, TIMEOUT, INSUFFICIENT_FUNDS' })
  }),

  duration: z.string().optional(),

  cascadingFor: z.number().int().min(1).max(4, 'Cascading for must be 1-4 (Card/UPI/Crypto/APM)'),

  status: z.boolean(),

  config: z.array(z.object({
    merchantAcquirerAccountId: z.string().min(1, 'Fallback connector is required'),
    merchantAcquirerAccountName: z.string(),
  })).min(1, 'At least one fallback connector is required'),
}).refine((data) => {
  const primaryId = String(data.merchantAcquirerAccountId);
  return !data.config.some((c) => c.merchantAcquirerAccountId === primaryId);
}, {
  message: 'Fallback connector cannot be the same as Primary Connector',
  path: ['config'],
});

// Type definitions
export type CreateCascadingFormData = z.infer<typeof createCascadingSchema>;
