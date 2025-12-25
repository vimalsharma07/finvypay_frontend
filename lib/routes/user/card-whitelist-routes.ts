/**
 * User - Card Whitelist Management Routes
 * All endpoints related to user card whitelist operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userCardWhitelistRoutes = {
  list: `/user/card-whitelist`,
  getById: (id: string | number) => `/user/card-whitelist/${id}`,
  create: `/user/card-whitelist`,
  update: (id: string | number) => `/user/card-whitelist/${id}`,
  delete: (id: string | number) => `/user/card-whitelist/${id}`,
} as const;

