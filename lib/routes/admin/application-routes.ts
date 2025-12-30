/**
 * Admin - Application Routes
 * Endpoints related to application counts and overview
 */

export const adminApplicationRoutes = {
  counts: `/admin/application/counts`,
  merchants: `/admin/application/merchants`,
  changeStatus: `/admin/application/change-status`,
  merchantDetails: (merchantId: string | number) => `/admin/application/merchant/${merchantId}/details`,
} as const;


