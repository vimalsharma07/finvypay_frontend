/**
 * Merchant - Reports Routes
 * All endpoints related to merchant reporting operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantReportRoutes = {
  report: `${BASE_URL}/user/report`,
  /** Build report URL for any report type */
  reportByType: (type: string, startDate: string, endDate: string) =>
    `${BASE_URL}/user/report?type=${encodeURIComponent(type)}&start_date=${startDate}&end_date=${endDate}`,
  /** @deprecated Use reportByType('merchant-turnover-report', ...) */
  merchantTurnover: (startDate: string, endDate: string) =>
    `${BASE_URL}/user/report?type=merchant-turnover-report&start_date=${startDate}&end_date=${endDate}`,
} as const;
