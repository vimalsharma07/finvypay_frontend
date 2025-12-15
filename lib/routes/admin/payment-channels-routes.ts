/**
 * Admin - Payment Channels Routes
 * All endpoints related to admin payment channels operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminPaymentChannelsRoutes = {
  list: `${BASE_URL}/admin/payment-channels`,
  getById: (id: string | number) => `${BASE_URL}/admin/payment-channels/${id}`,
  create: `${BASE_URL}/admin/payment-channels`,
  update: (id: string | number) => `${BASE_URL}/admin/payment-channels/${id}`,
  delete: (id: string | number) => `${BASE_URL}/admin/payment-channels/${id}`,
} as const;

