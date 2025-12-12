/**
 * Admin - Roles Management Routes
 * All endpoints related to roles operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const adminRolesRoutes = {
  list: `/permissions/roles`,
  getById: (id: string | number) => `/permissions/roles/${id}`,
  create: `/permissions/roles`,
  update: (id: string | number) => `/permissions/roles/${id}`,
  delete: (id: string | number) => `/permissions/roles/${id}`,
} as const;

