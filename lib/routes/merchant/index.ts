/**
 * Merchant Module Routes
 * Aggregates all merchant sub-module routes
 */

import { merchantUserRoutes } from './user-routes';
import { merchantMasterRoutes } from './master-routes';
import { merchantReportRoutes } from './report-routes';
import { merchantTransactionRoutes } from './transaction-routes';
import { merchantRatesRoutes } from './merchant-rates-routes';
import { merchantNotificationRoutes } from './notification-routes';
import { merchantDashboardRoutes } from './dashboard-routes';

export const merchantModuleRoutes = {
  users: merchantUserRoutes,
  master: merchantMasterRoutes,
  reports: merchantReportRoutes,
  transactions: merchantTransactionRoutes,
  rates: merchantRatesRoutes,
  notifications: merchantNotificationRoutes,
  dashboard: merchantDashboardRoutes,
} as const;
