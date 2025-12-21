import { z } from 'zod';

// Utility function for number validation with decimal support
const numberValidation = (fieldName: string) => {
  return z
    .string({ required_error: `${fieldName} is required` })
    .refine((val) => !/^\s*$/.test(val), `${fieldName} cannot contain only spaces`)
    .refine((val) => /^[0-9]*\.?[0-9]*$/.test(val), `${fieldName} must contain only numbers and a single decimal point`)
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), `${fieldName} must have at most two decimal places`)
    .refine((val) => Number(val) >= 0, `${fieldName} cannot be negative`);
};

// Card connector rate schema (Normal)
export const userCardConnectorRateSchema = z.object({
  base_mdr: numberValidation('Default MDR'),
  visa_mdr: numberValidation('Visa MDR'),
  master_mdr: numberValidation('Master MDR'),
  rolling_reserve: numberValidation('Rolling Reserve'),
  success_transaction_fee: numberValidation('Success Transaction Fee'),
  declined_transaction_fee: numberValidation('Declined Transaction Fee'),
  chargeback_fee: numberValidation('Chargeback Fee'),
  flagged_fee: numberValidation('Flagged Fee'),
  setup_fee: numberValidation('Setup Fee'),
  refund_fee: numberValidation('Refund Fee'),
});

// Tiered connector rate schema
export const userTieredConnectorRateSchema = z.object({
  default_mdr: numberValidation('Default MDR'),
  setup_fee: numberValidation('Setup Fee'),
  refund_fee: numberValidation('Refund Fee'),
  chargeback_fee: numberValidation('Chargeback Fee'),
  suspicious_fee: numberValidation('Suspicious Fee'),
  rolling_reserve: numberValidation('Rolling Reserve'),
  success_transaction_fee: numberValidation('Success Transaction Fee'),
  declined_transaction_fee: numberValidation('Declined Transaction Fee'),
  mdr: z
    .array(
      z.object({
        min: numberValidation('Min. MDR'),
        max: numberValidation('Max. MDR'),
        rate: numberValidation('Rate'),
      })
    )
    .min(1, { message: 'At least one Dynamic MDR tier is required' }),
});

// Crypto Payin connector rate schema (Normal)
export const userCryptoPayinConnectorRateSchema = z.object({
  base_mdr: numberValidation('Default MDR'),
  success_transaction_fee: numberValidation('Success Transaction Fee'),
  declined_transaction_fee: numberValidation('Declined Transaction Fee'),
  setup_fee: numberValidation('Setup Fee'),
});

// Tiered Payin connector rate schema
export const userTieredPayinConnectorRateSchema = z.object({
  setup_fee: numberValidation('Setup Fee'),
  default_mdr: numberValidation('Default MDR'),
  success_transaction_fee: numberValidation('Success Transaction Fee'),
  declined_transaction_fee: numberValidation('Declined Transaction Fee'),
  mdr: z
    .array(
      z.object({
        min: numberValidation('Min. MDR'),
        max: numberValidation('Max. MDR'),
        rate: numberValidation('Rate'),
      })
    )
    .min(1, { message: 'At least one Dynamic MDR tier is required' }),
});

export type UserCardConnectorRateFormData = z.infer<typeof userCardConnectorRateSchema>;
export type UserTieredConnectorRateFormData = z.infer<typeof userTieredConnectorRateSchema>;
export type UserCryptoPayinConnectorRateFormData = z.infer<typeof userCryptoPayinConnectorRateSchema>;
export type UserTieredPayinConnectorRateFormData = z.infer<typeof userTieredPayinConnectorRateSchema>;

