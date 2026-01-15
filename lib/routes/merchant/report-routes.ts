/**
 * Merchant - Reports Routes
 * All endpoints related to merchant reporting operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantReportRoutes = {
  report: `${BASE_URL}/user/report`,
  merchantTurnover: (startDate: string, endDate: string) => 
    `${BASE_URL}/user/report?type=merchant-turnover-report&start_date=${startDate}&end_date=${endDate}`,
} as const;
