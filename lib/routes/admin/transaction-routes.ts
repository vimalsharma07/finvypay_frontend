/**
 * Admin - Transaction Routes
 * All endpoints related to admin transaction operations
 */

export const adminTransactionRoutes = {
  production: `/admin/transaction/production`,
  sandbox: `/admin/transaction/sandbox`,
  chargeback: (transactionId: string | number) => `/transactions/${transactionId}/chargeback`,
  refund: (transactionId: string | number) => `/transactions/${transactionId}/refund`,
  suspicious: (transactionId: string | number) => `/transactions/${transactionId}/suspicious`,
} as const;
