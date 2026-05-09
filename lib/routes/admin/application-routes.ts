/**
 * Admin - Application Routes
 * Endpoints related to application counts and overview
 */

export const adminApplicationRoutes = {
  counts: `/admin/application/counts`,
  merchants: `/admin/application/merchants`,
  changeStatus: `/admin/application/change-status`,
  merchantDetails: (merchantId: string | number) => `/admin/application/merchant/${merchantId}/details`,
  // Affiliate applications
  affiliateCount: `/admin/application/affiliate/count`,
  affiliatePending: `/admin/application/affiliate/pending`,
  affiliateById: (id: string | number) => `/admin/application/affiliate/${id}`,
  affiliateApprove: (id: string | number) => `/admin/application/affiliate/${id}/approve`,
} as const;


