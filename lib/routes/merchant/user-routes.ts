/**
 * Merchant - User Management Routes
 * All endpoints related to merchant user operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantUserRoutes = {
  list: `${BASE_URL}/merchant/user-management`,
  getById: (id: string) => `${BASE_URL}/merchant/user-management/${id}`,
  create: `${BASE_URL}/merchant/user-management`,
  update: (id: string) => `${BASE_URL}/merchant/user-management/${id}`,
  delete: (id: string) => `${BASE_URL}/merchant/user-management/${id}`,
  search: `${BASE_URL}/merchant/user-management/search`,
  bulkDelete: `${BASE_URL}/merchant/user-management/bulk-delete`,
} as const;
