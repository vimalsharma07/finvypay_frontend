/**
 * Admin - Reports Routes
 * All endpoints related to admin reporting operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminReportRoutes = {
  report: `${BASE_URL}/admin/report`,
  merchantTurnover: (startDate: string, endDate: string) => 
    `${BASE_URL}/admin/report?type=merchant-turnover-report&start_date=${startDate}&end_date=${endDate}`,
} as const;
