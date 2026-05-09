/**
 * Merchant - Risk Management Routes
 * All endpoints related to merchant risk management operations
 * 
 * Note: Routes should be relative paths (starting with /)
 * The api.ts file will automatically prepend NEXT_PUBLIC_API_URL
 */

export const userRiskManagementRoutes = {
  list: `/merchant/risk-management`,
  getById: (id: string | number) => `/merchant/risk-management/${id}`,
  create: `/merchant/risk-management`,
  update: (id: string | number) => `/merchant/risk-management/${id}`,
  delete: (id: string | number) => `/merchant/risk-management/${id}`,
  types: `/merchant/risk-management/types`,
} as const;

