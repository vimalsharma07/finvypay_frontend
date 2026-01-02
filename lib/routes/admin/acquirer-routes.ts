/**
 * Admin - Acquirer Routes
 * All endpoints related to admin acquirer operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminAcquirerRoutes = {
  list: `${BASE_URL}/admin/acquirer`,
  getById: (id: string | number) => `${BASE_URL}/admin/acquirer/${id}`,
  create: `${BASE_URL}/admin/acquirer`,
  update: (id: string | number) => `${BASE_URL}/admin/acquirer/${id}`,
  delete: (id: string | number) => `${BASE_URL}/admin/acquirer/${id}`,
  merchantAcquirerRequests: `${BASE_URL}/admin/application/merchant-acquirer-requests`,
  getMerchantAcquirerRequest: (id: string | number) => `${BASE_URL}/admin/application/merchant-acquirer-requests/${id}`,
  updateMerchantAcquirerRequestStatus: (id: string | number) => `${BASE_URL}/admin/application/merchant-acquirer-requests/${id}/status`,
} as const;

