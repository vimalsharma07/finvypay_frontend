/**
 * Admin - Gateway Routes
 * All endpoints related to admin gateway operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminGatewayRoutes = {
  list: `${BASE_URL}/admin/gateway`,
  getById: (id: string | number) => `${BASE_URL}/admin/gateway/${id}`,
  create: `${BASE_URL}/admin/gateway`,
  update: (id: string | number) => `${BASE_URL}/admin/gateway/${id}`,
  delete: (id: string | number) => `${BASE_URL}/admin/gateway/${id}`,
} as const;

