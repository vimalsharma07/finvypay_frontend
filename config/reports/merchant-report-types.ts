/**
 * Merchant Report Types Configuration
 *
 * Centralized config for all merchant report types. Same report types as Admin,
 * using /user/report API with different type parameter.
 *
 * - slug: URL path segment (e.g., /reports/merchant-turnover)
 * - apiType: API type parameter sent to backend
 * - title: Display name in sidebar and page header
 * - description: Page description
 */

export interface MerchantReportTypeConfig {
  slug: string;
  apiType: string;
  title: string;
  description: string;
}

export const MERCHANT_REPORT_TYPES: MerchantReportTypeConfig[] = [
  {
    slug: 'merchant-turnover',
    apiType: 'merchant-turnover-report',
    title: 'Merchant Turnover',
    description: 'View merchant turnover reports with transaction statistics, success rates, and performance metrics',
  },
  {
    slug: 'merchant-transaction',
    apiType: 'merchant-transaction-report',
    title: 'Merchant Transaction',
    description: 'View merchant transaction reports with detailed transaction data',
  },
  {
    slug: 'mid-transaction',
    apiType: 'mid-transaction-report',
    title: 'MID Transaction',
    description: 'View MID (Merchant ID) transaction reports',
  },
  {
    slug: 'transaction-summary',
    apiType: 'transaction-summary-report',
    title: 'Transaction Summary',
    description: 'View transaction summary reports with aggregated metrics',
  },
  {
    slug: 'merchant-transaction-response',
    apiType: 'merchant-transaction-response',
    title: 'Merchant Transaction Response',
    description: 'View merchant transaction response reports',
  },
  {
    slug: 'country-wise-transaction',
    apiType: 'country-wise-transaction-report',
    title: 'Country-wise Transaction',
    description: 'View country-wise transaction distribution and metrics',
  },
  {
    slug: 'bin-wise-transaction',
    apiType: 'bin-wise-transaction-report',
    title: 'BIN-wise Transaction',
    description: 'View BIN (Bank Identification Number) wise transaction reports',
  },
  {
    slug: 'provider-rates',
    apiType: 'provider-rates',
    title: 'Provider Rates',
    description: 'View provider rates and fee structures',
  },
];

/** Map slug -> config for quick lookup */
export const MERCHANT_REPORT_BY_SLUG = Object.fromEntries(
  MERCHANT_REPORT_TYPES.map((r) => [r.slug, r])
) as Record<string, MerchantReportTypeConfig>;

/** Valid slugs for route validation */
export const VALID_MERCHANT_REPORT_SLUGS = new Set(
  MERCHANT_REPORT_TYPES.map((r) => r.slug)
);
