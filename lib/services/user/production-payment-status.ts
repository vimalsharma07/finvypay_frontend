import { http } from '@/lib/api';

/**
 * GET https://{API}/api/production/status/{transactionId}
 * Uses absolute URL so the request hits the backend (paths like /api/production/... are otherwise treated as internal Next routes).
 */
export async function getProductionPaymentStatus(transactionId: string): Promise<any> {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');
  if (!base) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }
  const url = `${base}/api/production/status/${encodeURIComponent(transactionId.trim())}`;
  return http.get(url, { auth: false });
}
