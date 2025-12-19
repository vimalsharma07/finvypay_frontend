/**
 * Admin - Card Whitelist Management Routes
 * All endpoints related to card whitelist operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const adminCardWhitelistRoutes = {
  list: `/admin/card-whitelist`,
  getById: (id: string | number) => `/admin/card-whitelist/${id}`,
  create: `/admin/card-whitelist`,
  update: (id: string | number) => `/admin/card-whitelist/${id}`,
  delete: (id: string | number) => `/admin/card-whitelist/${id}`,
} as const;

