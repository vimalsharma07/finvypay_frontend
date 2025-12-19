/**
 * Admin - Risk Management Routes
 * All endpoints related to risk management operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const adminRiskManagementRoutes = {
  list: `/admin/risk-management`,
  getById: (id: string | number) => `/admin/risk-management/${id}`,
  create: `/admin/risk-management`,
  update: (id: string | number) => `/admin/risk-management/${id}`,
  delete: (id: string | number) => `/admin/risk-management/${id}`,
  types: `/admin/risk-management/types`,
} as const;

