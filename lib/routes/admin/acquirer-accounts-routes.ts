/**
 * Admin - Acquirer Accounts Routes
 * All endpoints related to admin acquirer accounts operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminAcquirerAccountsRoutes = {
  list: `${BASE_URL}/admin/acquirer-accounts`,
  getById: (id: string | number) => `${BASE_URL}/admin/acquirer-accounts/${id}`,
  create: `${BASE_URL}/admin/acquirer-accounts`,
  update: (id: string | number) => `${BASE_URL}/admin/acquirer-accounts/${id}`,
  updateStatus: (id: string | number) => `${BASE_URL}/admin/acquirer-accounts/${id}/status`,
  delete: (id: string | number) => `${BASE_URL}/admin/acquirer-accounts/${id}`,
  softDelete: (id: string | number) => `${BASE_URL}/admin/merchant-acquirer-account/${id}/soft-delete`,
  getMerchantAcquirerAccount: (id: string | number) => `${BASE_URL}/admin/merchant-acquirer-account/${id}`,
  updateMerchantAcquirerAccount: (id: string | number) => `${BASE_URL}/admin/merchant-acquirer-account/${id}`,
  rejectMerchantAcquirerAccount: (id: string | number) => `${BASE_URL}/admin/merchant-acquirer-account/${id}/reject`,
  togglePrimary: (id: string | number) => `${BASE_URL}/admin/merchant-acquirer-account/${id}/toggle-primary`,
  toggleActive: (id: string | number) => `${BASE_URL}/admin/merchant-acquirer-account/${id}/toggle-active`,
} as const;

