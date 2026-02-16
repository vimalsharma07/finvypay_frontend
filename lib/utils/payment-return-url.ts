/**
 * Payment return URL for transaction APIs (production/card, sandbox/card).
 * Used as returnUrl in payload so the gateway redirects back to the app.
 */

const PAYMENT_PATH = '/payment';

/** Returns the app URL for payment return. Client-only; empty on server. */
export function getPaymentReturnUrl(): string {
  if (typeof window === 'undefined') return '';
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/+$/, '');
  const path = basePath ? `${basePath}${PAYMENT_PATH}` : PAYMENT_PATH;
  return `${window.location.origin}${path}`;
}
