/**
 * Admin - Transaction Routes
 * All endpoints related to admin transaction operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminTransactionRoutes = {
  // Add your admin transaction module endpoints here
  // Example structure:
  // list: `${BASE_URL}/admin/transactions`,
  // getById: (id: string) => `${BASE_URL}/admin/transactions/${id}`,
  // create: `${BASE_URL}/admin/transactions`,
  // update: (id: string) => `${BASE_URL}/admin/transactions/${id}`,
  // delete: (id: string) => `${BASE_URL}/admin/transactions/${id}`,
  // search: `${BASE_URL}/admin/transactions/search`,
  // filter: `${BASE_URL}/admin/transactions/filter`,
  // export: `${BASE_URL}/admin/transactions/export`,
} as const;
