/**
 * Admin - Logs Routes
 * All endpoints related to admin logs operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export type AdminLogsUrlParams = {
  type: string;
  limit: number;
  cursor?: string;
  startDate?: string;
  endDate?: string;
  transactionId?: string;
  paymentMode?: string;
};

export const adminLogRoutes = {
  logs: (opts: AdminLogsUrlParams) => {
    const params = new URLSearchParams({
      type: opts.type,
      limit: String(opts.limit),
    });
    if (opts.cursor?.trim()) {
      params.append('cursor', opts.cursor.trim());
    }
    if (opts.startDate) params.append('start_date', opts.startDate);
    if (opts.endDate) params.append('end_date', opts.endDate);
    if (opts.transactionId?.trim()) {
      params.append('transaction_id', opts.transactionId.trim());
    }
    if (opts.paymentMode?.trim()) {
      params.append('payment_mode', opts.paymentMode.trim());
    }
    return `${BASE_URL}/admin/logs?${params.toString()}`;
  },
} as const;
