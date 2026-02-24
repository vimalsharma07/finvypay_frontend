import { z } from 'zod';

const AGREEMENT_TYPES = ['user', 'affiliate'] as const;
const AGREEMENT_STATUSES = ['active', 'inactive'] as const;

/** Strip HTML tags for length validation (rich text content) */
function plainTextLength(html: string): number {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().length;
}

/**
 * Validation schema for creating a new agreement
 */
export const createAgreementSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Agreement name is required.' })
    .min(2, { message: 'Agreement name must be at least 2 characters.' }),
  type: z
    .string()
    .min(1, { message: 'Agreement type is required.' })
    .refine((val) => AGREEMENT_TYPES.includes(val.toLowerCase() as (typeof AGREEMENT_TYPES)[number]), {
      message: `Type must be one of: ${AGREEMENT_TYPES.join(', ')}.`,
    }),
  desc: z
    .string()
    .min(1, { message: 'Description is required.' })
    .refine((val) => plainTextLength(val) >= 10, {
      message: 'Description must be at least 10 characters (excluding formatting).',
    }),
  status: z
    .string()
    .min(1, { message: 'Status is required.' })
    .refine((val) => AGREEMENT_STATUSES.includes(val.toLowerCase() as (typeof AGREEMENT_STATUSES)[number]), {
      message: `Status must be one of: ${AGREEMENT_STATUSES.join(', ')}.`,
    }),
});

export type CreateAgreementSchemaType = z.infer<typeof createAgreementSchema>;

/**
 * Validation schema for updating an agreement (name, desc, status only)
 */
export const updateAgreementSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Agreement name is required.' })
    .min(2, { message: 'Agreement name must be at least 2 characters.' }),
  desc: z
    .string()
    .min(1, { message: 'Description is required.' })
    .refine((val) => plainTextLength(val) >= 10, {
      message: 'Description must be at least 10 characters (excluding formatting).',
    }),
  status: z
    .string()
    .min(1, { message: 'Status is required.' })
    .refine((val) => AGREEMENT_STATUSES.includes(val.toLowerCase() as (typeof AGREEMENT_STATUSES)[number]), {
      message: `Status must be one of: ${AGREEMENT_STATUSES.join(', ')}.`,
    }),
});

export type UpdateAgreementSchemaType = z.infer<typeof updateAgreementSchema>;
