/**
 * Labels for `payment_source` / paymentSource (backend PaymentSource enum string values).
 */
const PAYMENT_SOURCE_LABELS: Record<string, string> = {
  api: 'API',
  payment_link: 'Payment Link',
  hosted_page: 'Hosted page',
  widget: 'Widget',
  mobile_sdk: 'Mobile SDK',
};

/**
 * Display label for transaction payment source. Defaults to API when missing (matches backend default).
 */
export function formatPaymentSourceDisplay(source: unknown): string {
  if (source == null || source === '') {
    return 'API';
  }
  const key = String(source).toLowerCase().trim();
  return PAYMENT_SOURCE_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
