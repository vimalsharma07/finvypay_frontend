/**
 * Merchant - Transaction Routes
 * All endpoints related to merchant transaction operations
 */

export const userTransactionRoutes = {
  production: `/merchant/transaction/production`,
  sandbox: `/merchant/transaction/sandbox`,
  getProductionById: (id: string | number) => `/merchant/transaction/production/${id}`,
  getSandboxById: (id: string | number) => `/merchant/transaction/sandbox/${id}`,
} as const;

