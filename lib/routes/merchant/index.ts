/**
 * Merchant Module Routes
 * Aggregates all merchant sub-module routes
 */

import { merchantUserRoutes } from './user-routes';
import { merchantMasterRoutes } from './master-routes';
import { merchantReportRoutes } from './report-routes';
import { merchantTransactionRoutes } from './transaction-routes';

export const merchantModuleRoutes = {
  users: merchantUserRoutes,
  master: merchantMasterRoutes,
  reports: merchantReportRoutes,
  transactions: merchantTransactionRoutes,
} as const;
