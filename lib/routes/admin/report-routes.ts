/**
 * Admin - Reports Routes
 * All endpoints related to admin reporting operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminReportRoutes = {
  // Add your admin report module endpoints here
  // Example structure:
  // list: `${BASE_URL}/admin/reports`,
  // generate: (type: string) => `${BASE_URL}/admin/reports/${type}`,
  // download: (id: string) => `${BASE_URL}/admin/reports/${id}/download`,
  // export: (id: string, format: string) => `${BASE_URL}/admin/reports/${id}/export?format=${format}`,
} as const;
