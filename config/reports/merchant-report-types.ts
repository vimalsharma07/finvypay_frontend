/**
 * Merchant Report Types Configuration
 *
 * Only these three report types are available on the merchant side.
 * Uses /user/report API with type parameter.
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

/** Merchant side: Overall turnover, Transaction Summary, BIN-wise transaction only */
export const MERCHANT_REPORT_TYPES: MerchantReportTypeConfig[] = [
  {
    slug: 'merchant-turnover',
    apiType: 'merchant-turnover-report',
    title: 'Turnover Pulse',
    description: 'See volume, success rates, and performance trends across your payments',
  },
  {
    slug: 'transaction-summary',
    apiType: 'transaction-summary-report',
    title: 'Payment Snapshot',
    description: 'Aggregated success, decline, refund, and chargeback metrics by currency',
  },
  {
    slug: 'bin-wise-transaction',
    apiType: 'bin-wise-transaction-report',
    title: 'BIN Pulse',
    description: 'Break down activity by card BIN to spot issuer patterns',
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
