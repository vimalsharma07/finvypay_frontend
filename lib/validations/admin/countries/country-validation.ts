import { z } from 'zod';

/**
 * Validation schema for creating a new country
 */
export const createCountrySchema = z.object({
  countryName: z
    .string()
    .min(1, { message: 'Country name is required.' })
    .min(2, { message: 'Country name must be at least 2 characters long.' }),
  local: z
    .string()
    .min(1, { message: 'Local name is required.' }),
  phoneCode: z
    .string()
    .min(1, { message: 'Phone code is required.' })
    .regex(/^\d+$/, { message: 'Phone code must contain only digits.' }),
  isoTwo: z
    .string()
    .length(2, { message: 'ISO 2 code must be exactly 2 characters.' })
    .toUpperCase(),
  isoThree: z
    .string()
    .length(3, { message: 'ISO 3 code must be exactly 3 characters.' })
    .toUpperCase(),
  flag: z
    .string()
    .min(1, { message: 'Flag emoji is required.' }),
  currencyName: z
    .string()
    .min(1, { message: 'Currency name is required.' }),
  currencyCode: z
    .string()
    .length(3, { message: 'Currency code must be exactly 3 characters.' })
    .toUpperCase(),
  currencySymbol: z
    .string()
    .min(1, { message: 'Currency symbol is required.' }),
  continent: z
    .string()
    .min(1, { message: 'Continent is required.' }),
  status: z
    .string()
    .min(1, { message: 'Status is required.' })
    .refine((val) => ['active', 'inactive'].includes(val.toLowerCase()), {
      message: 'Status must be either "active" or "inactive".',
    }),
});

export type CreateCountrySchemaType = z.infer<typeof createCountrySchema>;

/**
 * Validation schema for updating a country
 */
export const updateCountrySchema = z.object({
  countryName: z
    .string()
    .min(1, { message: 'Country name is required.' })
    .min(2, { message: 'Country name must be at least 2 characters long.' })
    .optional(),
  local: z
    .string()
    .min(1, { message: 'Local name is required.' })
    .optional(),
  phoneCode: z
    .string()
    .min(1, { message: 'Phone code is required.' })
    .regex(/^\d+$/, { message: 'Phone code must contain only digits.' })
    .optional(),
  isoTwo: z
    .string()
    .length(2, { message: 'ISO 2 code must be exactly 2 characters.' })
    .toUpperCase()
    .optional(),
  isoThree: z
    .string()
    .length(3, { message: 'ISO 3 code must be exactly 3 characters.' })
    .toUpperCase()
    .optional(),
  flag: z
    .string()
    .min(1, { message: 'Flag emoji is required.' })
    .optional(),
  currencyName: z
    .string()
    .min(1, { message: 'Currency name is required.' })
    .optional(),
  currencyCode: z
    .string()
    .length(3, { message: 'Currency code must be exactly 3 characters.' })
    .toUpperCase()
    .optional(),
  currencySymbol: z
    .string()
    .min(1, { message: 'Currency symbol is required.' })
    .optional(),
  continent: z
    .string()
    .min(1, { message: 'Continent is required.' })
    .optional(),
  status: z
    .string()
    .min(1, { message: 'Status is required.' })
    .refine((val) => ['active', 'inactive'].includes(val.toLowerCase()), {
      message: 'Status must be either "active" or "inactive".',
    })
    .optional(),
});

export type UpdateCountrySchemaType = z.infer<typeof updateCountrySchema>;
