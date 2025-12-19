/**
 * Admin Module Routes
 * Aggregates all admin sub-module routes
 */

import { adminUserRoutes } from './user-routes';
import { adminMasterRoutes } from './master-routes';
import { adminReportRoutes } from './report-routes';
import { adminTransactionRoutes } from './transaction-routes';
import { adminRolesRoutes } from './roles-routes';
import { adminPermissionsRoutes } from './permissions-routes';
import { adminIpWhitelistRoutes } from './ip-whitelist-routes';
import { adminCardWhitelistRoutes } from './card-whitelist-routes';
import { adminRiskManagementRoutes } from './risk-management-routes';
import { adminGatewayRoutes } from './gateway-routes';
import { adminPaymentChannelsRoutes } from './payment-channels-routes';
import { adminSupportTicketRoutes } from './support-ticket-routes';

export const adminModuleRoutes = {
  users: adminUserRoutes,
  master: adminMasterRoutes,
  reports: adminReportRoutes,
  transactions: adminTransactionRoutes,
  roles: adminRolesRoutes,
  permissions: adminPermissionsRoutes,
  ipWhitelist: adminIpWhitelistRoutes,
  cardWhitelist: adminCardWhitelistRoutes,
  riskManagement: adminRiskManagementRoutes,
  gateway: adminGatewayRoutes,
  paymentChannels: adminPaymentChannelsRoutes,
  supportTicket: adminSupportTicketRoutes,
} as const;
