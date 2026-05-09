/**
 * Merchant - Transaction Routes
 * All endpoints related to merchant transaction operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantTransactionRoutes = {
  // Add your merchant transaction module endpoints here
  // Example structure:
  // list: `${BASE_URL}/merchant/transactions`,
  // getById: (id: string) => `${BASE_URL}/merchant/transactions/${id}`,
  // create: `${BASE_URL}/merchant/transactions`,
  // update: (id: string) => `${BASE_URL}/merchant/transactions/${id}`,
  // delete: (id: string) => `${BASE_URL}/merchant/transactions/${id}`,
  // search: `${BASE_URL}/merchant/transactions/search`,
  // filter: `${BASE_URL}/merchant/transactions/filter`,
  // export: `${BASE_URL}/merchant/transactions/export`,
} as const;
