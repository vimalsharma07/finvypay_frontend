/**
 * Admin - User Management Routes
 * All endpoints related to admin user/merchant operations
 * 
 * Note: These are relative paths. The api.ts will prepend NEXT_PUBLIC_API_URL.
 * Backend uses /user-management for all roles (ADMIN, MERCHANT, AFFILIATE).
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
  toggleBlockStatus: (id: string) => `${BASE_URL}/user-management/${id}/block`,
  disable2Fa: (id: string) => `${BASE_URL}/user-management/${id}/disable-2fa`,
  getAllowedRoles: `${BASE_URL}/user-management/roles/allowed`,
  impersonate: (id: string) => `${BASE_URL}/user-management/${id}/impersonate`,
} as const;

// Alias for backward compatibility
export const adminMerchantRoutes = adminUserRoutes;
