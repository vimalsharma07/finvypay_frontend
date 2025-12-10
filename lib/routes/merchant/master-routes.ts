/**
 * Merchant - Master Data Routes
 * All endpoints related to merchant master data operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const merchantMasterRoutes = {
  // Add your merchant master module endpoints here
  // Example structure:
  // list: `${BASE_URL}/merchant/master`,
  // getById: (id: string) => `${BASE_URL}/merchant/master/${id}`,
  // create: `${BASE_URL}/merchant/master`,
  // update: (id: string) => `${BASE_URL}/merchant/master/${id}`,
  // delete: (id: string) => `${BASE_URL}/merchant/master/${id}`,
} as const;
