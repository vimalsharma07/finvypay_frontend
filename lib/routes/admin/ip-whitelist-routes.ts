/**
 * Admin - IP Whitelist Management Routes
 * All endpoints related to IP whitelist operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const adminIpWhitelistRoutes = {
  list: `/admin/ip-whitelist`,
  getById: (id: string | number) => `/admin/ip-whitelist/${id}`,
  create: `/admin/ip-whitelist`,
  update: (id: string | number) => `/admin/ip-whitelist/${id}`,
  updateStatus: (id: string | number) => `/admin/ip-whitelist/${id}/status`,
  delete: (id: string | number) => `/admin/ip-whitelist/${id}`,
} as const;

