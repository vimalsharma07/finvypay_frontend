/**
 * Payment return URL for transaction APIs (production/card, sandbox/card).
 * Used as returnUrl in payload so the gateway redirects back to the app.
 */

const PAYMENT_STATUS_PATH = '/payment/status';

/**
 * Normalize NEXT_PUBLIC_BASE_PATH to a pathname prefix only.
 * If env is mistakenly set to a full origin (e.g. http://localhost:3000), only the pathname is used
 * so we never produce duplicate origins like http://localhost:3000http://localhost:3000/...
 */
function normalizeAppBasePath(): string {
  const raw = (process.env.NEXT_PUBLIC_BASE_PATH || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) {
    try {
      const pathname = new URL(raw).pathname.replace(/\/+$/, '');
      return pathname === '/' ? '' : pathname;
    } catch {
      return '';
    }
  }
  const withLeading = raw.startsWith('/') ? raw : `/${raw}`;
  return withLeading.replace(/\/+$/, '');
}

/** Returns the app URL for payment return after 3DS / gateway redirect. Client-only; empty on server. */
export function getPaymentReturnUrl(): string {
  if (typeof window === 'undefined') return '';
  const basePath = normalizeAppBasePath();
  const path = basePath ? `${basePath}${PAYMENT_STATUS_PATH}` : PAYMENT_STATUS_PATH;
  return `${window.location.origin}${path}`;
}
