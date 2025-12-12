/**
 * Admin - Permissions Management Routes
 * All endpoints related to permissions operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const adminPermissionsRoutes = {
  list: `/permissions/permissions`,
  getById: (id: string | number) => `/permissions/permissions/${id}`,
  create: `/permissions/permissions`,
  update: (id: string | number) => `/permissions/permissions/${id}`,
  delete: (id: string | number) => `/permissions/permissions/${id}`,
} as const;

