/**
 * User - Risk Management Routes
 * All endpoints related to user risk management operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userRiskManagementRoutes = {
  list: `/user/risk-management`,
  getById: (id: string | number) => `/user/risk-management/${id}`,
  create: `/user/risk-management`,
  update: (id: string | number) => `/user/risk-management/${id}`,
  delete: (id: string | number) => `/user/risk-management/${id}`,
  types: `/user/risk-management/types`,
} as const;

