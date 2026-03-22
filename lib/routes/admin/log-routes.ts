/**
 * Admin - Logs Routes
 * All endpoints related to admin logs operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminLogRoutes = {
  logs: (
    type: string,
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    transactionId?: string,
    paymentMode?: string
  ) => {
    const params = new URLSearchParams({
      type,
      page: String(page),
      limit: String(limit),
    });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (transactionId?.trim()) params.append('transaction_id', transactionId.trim());
    if (paymentMode?.trim()) params.append('payment_mode', paymentMode.trim());
    return `${BASE_URL}/admin/logs?${params.toString()}`;
  },
} as const;

