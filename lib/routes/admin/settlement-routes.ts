/**
 * Admin - Settlement Routes
 * Endpoints related to settlements management
 */

export const adminSettlementRoutes = {
  list: `/admin/settlements`,
  getById: (id: string | number) => `/admin/settlements/${id}`,
  update: (id: string | number) => `/admin/settlements/${id}`,
  generate: `/admin/settlements/generate`,
  balancesList: `/admin/settlements/balances/list`,
  summary: `/admin/settlements/summary`,
  calculationsList: `/admin/settlements/calculations/list`,
} as const;

