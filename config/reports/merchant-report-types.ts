/**
 * Merchant Report Types Configuration
 *
 * Only these three reports are shown to merchants:
 * - Overall turnover report
 * - Transaction summary
 * - BIN-wise transaction
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
    title: 'Overall Turnover Report',
    description: 'View merchant turnover reports with transaction statistics, success rates, and performance metrics',
  },
  {
    slug: 'transaction-summary',
    apiType: 'transaction-summary-report',
    title: 'Transaction Summary',
    description: 'View transaction summary reports with aggregated metrics',
  },
  {
    slug: 'bin-wise-transaction',
    apiType: 'bin-wise-transaction-report',
    title: 'BIN-wise Transaction',
    description: 'View BIN (Bank Identification Number) wise transaction reports',
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
