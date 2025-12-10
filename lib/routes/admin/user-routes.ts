/**
 * Admin - User Management Routes
 * All endpoints related to admin user operations
 * 
 * Note: These are relative paths. The api.ts will prepend NEXT_PUBLIC_API_URL.
 * Update the paths below to match your backend API structure.
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminUserRoutes = {
  list: `${BASE_URL}/user-management`,
  getById: (id: string) => `${BASE_URL}/user-management/${id}`,
  create: `${BASE_URL}/user-management`,
  update: (id: string) => `${BASE_URL}/user-management/${id}`,
  delete: (id: string) => `${BASE_URL}/user-management/${id}`,
  search: `${BASE_URL}/user-management/search`,
  bulkDelete: `${BASE_URL}/user-management/bulk-delete`,
} as const;
