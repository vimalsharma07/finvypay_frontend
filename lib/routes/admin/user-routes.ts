/**
 * Admin - User Management Routes
 * All endpoints related to admin user operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminUserRoutes = {
  list: `${BASE_URL}/admin/user-management`,
  getById: (id: string) => `${BASE_URL}/admin/user-management/${id}`,
  create: `${BASE_URL}/admin/user-management`,
  update: (id: string) => `${BASE_URL}/admin/user-management/${id}`,
  delete: (id: string) => `${BASE_URL}/admin/user-management/${id}`,
  search: `${BASE_URL}/admin/user-management/search`,
  bulkDelete: `${BASE_URL}/admin/user-management/bulk-delete`,
} as const;
