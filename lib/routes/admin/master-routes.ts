/**
 * Admin - Master Data Routes
 * All endpoints related to admin master data operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminMasterRoutes = {
  // Add your admin master module endpoints here
  // Example structure:
  // list: `${BASE_URL}/admin/master`,
  // getById: (id: string) => `${BASE_URL}/admin/master/${id}`,
  // create: `${BASE_URL}/admin/master`,
  // update: (id: string) => `${BASE_URL}/admin/master/${id}`,
  // delete: (id: string) => `${BASE_URL}/admin/master/${id}`,
} as const;
