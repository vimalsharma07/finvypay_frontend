/**
 * Merchant - Card Whitelist Management Routes
 * All endpoints related to merchant card whitelist operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userCardWhitelistRoutes = {
  list: `/merchant/card-whitelist`,
  getById: (id: string | number) => `/merchant/card-whitelist/${id}`,
  create: `/merchant/card-whitelist`,
  update: (id: string | number) => `/merchant/card-whitelist/${id}`,
  delete: (id: string | number) => `/merchant/card-whitelist/${id}`,
} as const;

