/**
 * Admin - Dashboard Routes
 * All endpoints related to admin dashboard operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminDashboardRoutes = {
  dashboard: (from: string, to: string) => 
    `${BASE_URL}/admin/dashboard?from=${from}&to=${to}`,
} as const;

