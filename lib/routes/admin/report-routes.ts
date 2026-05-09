/**
 * Admin - Reports Routes
 * All endpoints related to admin reporting operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export type AdminReportQueryExtras = Record<
  string,
  string | number | boolean | null | undefined
>;

export const adminReportRoutes = {
  report: `${BASE_URL}/admin/report`,
  /** Build report URL for any report type; optional filters (e.g. merchant_id) match backend query params */
  reportByType: (
    type: string,
    startDate: string,
    endDate: string,
    extras?: AdminReportQueryExtras
  ) => {
    const params = new URLSearchParams({
      type,
      start_date: startDate,
      end_date: endDate,
    });
    if (extras) {
      Object.entries(extras).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        params.set(key, String(value));
      });
    }
    return `${BASE_URL}/admin/report?${params.toString()}`;
  },
  /** @deprecated Use reportByType('merchant-turnover-report', ...) */
  merchantTurnover: (startDate: string, endDate: string) =>
    `${BASE_URL}/admin/report?type=merchant-turnover-report&start_date=${startDate}&end_date=${endDate}`,
} as const;
