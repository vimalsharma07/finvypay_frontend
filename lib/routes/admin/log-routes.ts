/**
 * Admin - Logs Routes
 * All endpoints related to admin logs operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminLogRoutes = {
  logs: (type: string, page: number, limit: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({
      type,
      page: String(page),
      limit: String(limit),
    });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return `${BASE_URL}/admin/logs?${params.toString()}`;
  },
} as const;

