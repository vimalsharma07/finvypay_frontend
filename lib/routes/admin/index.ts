/**
 * Admin Module Routes
 * Aggregates all admin sub-module routes
 */

import { adminUserRoutes } from './user-routes';
// Alias for backward compatibility
import { adminUserRoutes as adminMerchantRoutes } from './user-routes';
import { adminMasterRoutes } from './master-routes';
import { adminReportRoutes } from './report-routes';
import { adminTransactionRoutes } from './transaction-routes';
import { adminRolesRoutes } from './roles-routes';
import { adminPermissionsRoutes } from './permissions-routes';
import { adminIpWhitelistRoutes } from './ip-whitelist-routes';
import { adminCardWhitelistRoutes } from './card-whitelist-routes';
import { adminRiskManagementRoutes } from './risk-management-routes';
import { adminAcquirerRoutes } from './acquirer-routes';
import { adminAcquirerAccountsRoutes } from './acquirer-accounts-routes';
import { adminSupportTicketRoutes } from './support-ticket-routes';
import { merchantRatesRoutes } from './merchant-rates-routes';
import { adminApplicationRoutes } from './application-routes';
import { adminSettlementRoutes } from './settlement-routes';
import { adminNotificationRoutes } from './notification-routes';
import { adminDashboardRoutes } from './dashboard-routes';

// Re-export individual route sets for direct imports
export { merchantRatesRoutes };

export const adminModuleRoutes = {
  users: adminUserRoutes,
  // Alias for backward compatibility
  merchants: adminMerchantRoutes,
  master: adminMasterRoutes,
  reports: adminReportRoutes,
  transactions: adminTransactionRoutes,
  roles: adminRolesRoutes,
  permissions: adminPermissionsRoutes,
  ipWhitelist: adminIpWhitelistRoutes,
  cardWhitelist: adminCardWhitelistRoutes,
  riskManagement: adminRiskManagementRoutes,
  acquirer: adminAcquirerRoutes,
  acquirerAccounts: adminAcquirerAccountsRoutes,
  supportTicket: adminSupportTicketRoutes,
  merchantRates: merchantRatesRoutes,
  applications: adminApplicationRoutes,
  settlements: adminSettlementRoutes,
  notifications: adminNotificationRoutes,
  dashboard: adminDashboardRoutes,
} as const;
