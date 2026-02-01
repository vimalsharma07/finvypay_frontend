/**
 * Admin - Reports Routes
 * All endpoints related to admin reporting operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminReportRoutes = {
  report: `${BASE_URL}/admin/report`,
  /** Build report URL for any report type */
  reportByType: (type: string, startDate: string, endDate: string) =>
    `${BASE_URL}/admin/report?type=${encodeURIComponent(type)}&start_date=${startDate}&end_date=${endDate}`,
  /** @deprecated Use reportByType('merchant-turnover-report', ...) */
  merchantTurnover: (startDate: string, endDate: string) =>
    `${BASE_URL}/admin/report?type=merchant-turnover-report&start_date=${startDate}&end_date=${endDate}`,
} as const;
