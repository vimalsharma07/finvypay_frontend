/**
 * Merchant - Reports Routes
 * All endpoints related to merchant reporting operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantReportRoutes = {
  // Add your merchant report module endpoints here
  // Example structure:
  // list: `${BASE_URL}/merchant/reports`,
  // generate: (type: string) => `${BASE_URL}/merchant/reports/${type}`,
  // download: (id: string) => `${BASE_URL}/merchant/reports/${id}/download`,
  // export: (id: string, format: string) => `${BASE_URL}/merchant/reports/${id}/export?format=${format}`,
} as const;
