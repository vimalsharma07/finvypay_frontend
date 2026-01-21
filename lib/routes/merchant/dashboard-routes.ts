/**
 * Merchant - Dashboard Routes
 * All endpoints related to merchant dashboard operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantDashboardRoutes = {
  dashboard: (from: string, to: string) => 
    `${BASE_URL}/merchant/dashboard?from=${from}&to=${to}`,
} as const;

