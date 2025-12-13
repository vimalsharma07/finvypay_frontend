/**
 * User - IP Whitelist Management Routes
 * All endpoints related to user IP whitelist operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userIpWhitelistRoutes = {
  list: `/user/ip-whitelist`,
  getById: (id: string | number) => `/user/ip-whitelist/${id}`,
  update: (id: string | number) => `/user/ip-whitelist/${id}`,
  delete: (id: string | number) => `/user/ip-whitelist/${id}`,
} as const;

