/**
 * Merchant - IP Whitelist Management Routes
 * All endpoints related to merchant IP whitelist operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userIpWhitelistRoutes = {
  list: `/merchant/ip-whitelist`,
  getById: (id: string | number) => `/merchant/ip-whitelist/${id}`,
  create: `/merchant/ip-whitelist`,
  update: (id: string | number) => `/merchant/ip-whitelist/${id}`,
  delete: (id: string | number) => `/merchant/ip-whitelist/${id}`,
} as const;

