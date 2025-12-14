/**
 * Admin - Master Data Routes
 * All endpoints related to admin master data operations
 */

import { getBaseUrl } from '../config/base-url';

const BASE_URL = getBaseUrl();

export const adminMasterRoutes = {
  currency: {
    list: `${BASE_URL}/currency`,
  },
  countries: {
    list: `${BASE_URL}/countries`,
    getById: (id: string) => `${BASE_URL}/countries/${id}`,
    create: `${BASE_URL}/countries`,
    update: (id: string) => `${BASE_URL}/countries/${id}`,
    delete: (id: string) => `${BASE_URL}/countries/${id}`,
  },
} as const;
