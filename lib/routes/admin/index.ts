/**
 * Admin Module Routes
 * Aggregates all admin sub-module routes
 */

import { adminUserRoutes } from './user-routes';
import { adminMasterRoutes } from './master-routes';
import { adminReportRoutes } from './report-routes';
import { adminTransactionRoutes } from './transaction-routes';
import { adminRolesRoutes } from './roles-routes';

export const adminModuleRoutes = {
  users: adminUserRoutes,
  master: adminMasterRoutes,
  reports: adminReportRoutes,
  transactions: adminTransactionRoutes,
  roles: adminRolesRoutes,
} as const;
