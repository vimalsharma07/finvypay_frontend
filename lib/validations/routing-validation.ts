import { z } from 'zod';

/** Single routing condition (amount, currency, BIN, etc.) — form uses a flat list; backend also accepts nested groups via API. */
export const routingConditionLeafSchema = z
  .object({
    category: z.string().min(1, 'Category is required'),
    operator: z.enum(
      ['>=', '<=', '>', '<', '==', '!=', 'in', 'not_in', 'between', 'not_between'],
      {
        errorMap: () => ({
          message:
            'Invalid operator. Must be one of: >=, <=, >, <, ==, !=, in, not_in, between, not_between',
        }),
      },
    ),
    value: z.union([
      z.string(),
      z.number(),
      z.array(z.string()),
      z.tuple([z.number(), z.number()]),
      z.tuple([z.string(), z.string()]),
    ]),
  })
  .superRefine((data, ctx) => {
    const v = data.value;
    if (data.operator === 'between' || data.operator === 'not_between') {
      if (!Array.isArray(v) || v.length !== 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'between / not_between require a two-element range',
          path: ['value'],
        });
      }
      return;
    }
    if (typeof v === 'string' && v.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Value is required',
        path: ['value'],
      });
    }
    if (Array.isArray(v) && (data.operator === 'in' || data.operator === 'not_in')) {
      if (v.length === 0 || !v.every((x) => String(x).trim().length > 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Value is required',
          path: ['value'],
        });
      }
    }
  });

export type RoutingConditionLeaf = z.infer<typeof routingConditionLeafSchema>;

/** @deprecated Use routingConditionLeafSchema */
export const routingConfigItemSchema = routingConditionLeafSchema;

// Create routing schema (flat conditions; combine with AND — matches backend top-level array semantics)
export const createRoutingSchema = z.object({
  name: z
    .string()
    .min(1, 'Routing name is required')
    .max(190, 'Routing name must be less than or equal to 190 characters')
    .refine((val) => !/^\s*$/.test(val), 'Routing name cannot contain only spaces'),

  routingFor: z.enum(['CARD', 'BANK_TRANSFER', 'CRYPTO', 'WALLET'], {
    errorMap: () => ({
      message:
        'Invalid routing type. Must be one of: CARD, BANK_TRANSFER, CRYPTO, WALLET',
    }),
  }),

  merchantProfileId: z.number().int().positive('Merchant profile ID must be a positive integer'),

  merchantAcquirerAccountId: z
    .number()
    .int()
    .positive('Merchant acquirer account ID must be a positive integer'),

  config: z
    .array(routingConditionLeafSchema)
    .min(1, 'At least one configuration rule is required'),

  splitEnable: z.boolean(),
});

// Type definitions
export type CreateRoutingFormData = z.infer<typeof createRoutingSchema>;
export type RoutingConfigItem = RoutingConditionLeaf;

// Create cascading schema (admin uses local state; user form uses this)
export const createCascadingSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Cascading name is required')
      .max(190, 'Cascading name must be less than or equal to 190 characters')
      .refine((val) => !/^\s*$/.test(val), 'Routing name cannot contain only spaces'),

    merchantProfileId: z.number().int().positive('Merchant profile ID must be a positive integer'),

    merchantAcquirerAccountId: z
      .number()
      .int()
      .positive('Primary acquirer account ID must be a positive integer'),

    type: z.enum(['DECLINED', 'FAILED', 'TIMEOUT', 'INSUFFICIENT_FUNDS'], {
      errorMap: () => ({
        message: 'Invalid cascading type. Must be one of: DECLINED, FAILED, TIMEOUT, INSUFFICIENT_FUNDS',
      }),
    }),

    duration: z.string().optional(),

    cascadingFor: z.number().int().min(1).max(4, 'Cascading for must be 1-4 (Card/UPI/Crypto/APM)'),

    status: z.boolean(),

    config: z
      .array(
        z.object({
          merchantAcquirerAccountId: z.string().min(1, 'Fallback connector is required'),
          merchantAcquirerAccountName: z.string(),
        }),
      )
      .min(1, 'At least one fallback connector is required'),
  })
  .refine(
    (data) => {
      const primaryId = String(data.merchantAcquirerAccountId);
      return !data.config.some((c) => c.merchantAcquirerAccountId === primaryId);
    },
    {
      message: 'Fallback connector cannot be the same as Primary Connector',
      path: ['config'],
    },
  );

// Type definitions
export type CreateCascadingFormData = z.infer<typeof createCascadingSchema>;
