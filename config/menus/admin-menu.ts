import {
  Bolt,
  Building2,
  ChartColumn,
  CircleDollarSign,
  ClipboardCheck,
  Codepen,
  FileSearch,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Route,
  Settings2,
  ShieldAlert,
  Theater,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { type MenuConfig } from '../types';
import { filterMenuByPermissions } from '@/lib/utils/permission-menu-matcher';

// Base admin menu configuration (before permission filtering)
const BASE_ADMIN_MENU: MenuConfig = [
  {
    title: 'Control Hub',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    requirePermission: false, // Dashboard always visible
  },
  {
    title: 'People Directory',
    icon: UsersRound,
    permissionModule: 'User Management',
    requirePermission: true,
    children: [
      { title: 'Platform Admins', path: '/admin/user-management/admin', submodule: 'Admin User' },
      { title: 'Merchant Partners', path: '/admin/user-management/merchant', submodule: 'Merchant User' },
      { title: 'Affiliate Partners', path: '/admin/user-management/affiliate', submodule: 'Affiliate User' },
    ],
  },
  {
    title: 'Money Flow',
    icon: WalletCards,
    permissionModule: 'Transactions',
    requirePermission: false,
    children: [
      { title: 'Live Activity', path: '/admin/transactions/transactions', submodule: 'Transactions' },
      { title: 'Test Activity', path: '/admin/transactions/sandbox-transactions', submodule: 'Sanbox Transactions' },
    ],
  },
  {
    title: 'Security Gates',
    icon: KeyRound,
    permissionModule: 'Roles & Permissions', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Role Profiles', path: '/admin/roles-permissions/roles', submodule: 'Role' },
      { title: 'Access Rights', path: '/admin/roles-permissions/permissions', submodule: 'Permission' },
    ],
  },
  {
    title: 'Fraud Shield',
    icon: ShieldAlert,
    permissionModule: 'Risk Management', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Risk Rules', path: '/admin/risk-compliance/manage-risk' }, // No specific submodule - shows if has any Risk Management permission
      { title: 'Trusted IPs', path: '/admin/risk-compliance/ip-allowlist', submodule: 'IP Whitelist' },
      { title: 'Safe Cards', path: '/admin/risk-compliance/trusted-cards' }, // No specific submodule - shows if has any Risk Management permission
    ],
  },
  {
    title: 'Bank Partners',
    icon: Building2,
    path: '/admin/acquirers',
    permissionModule: 'Acquirer Management', // Explicit permission module mapping
    requirePermission: true,
  },
  {
    title: 'Smart Routing',
    icon: Route,
    permissionModule: 'Routing',
    requirePermission: true,
    hidden: true, // Temporarily hidden from nav; pages under /admin/global-routing etc. remain available by URL
    children: [
      { title: 'Route Map', path: '/admin/global-routing', submodule: 'Global Routing' },
      { title: 'Failover Map', path: '/admin/global-cascading', submodule: 'Global Cascading' },
    ],
  },
  {
    title: 'Partner Intake',
    icon: ClipboardCheck,
    path: '/admin/applications',
    permissionModule: 'Application Management', // Explicit permission module mapping
    requirePermission: false,
  },
  {
    title: 'Fund Desk',
    icon: CircleDollarSign,
    permissionModule: 'Settlement Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Daily Pulse', path: '/admin/settlement/summary', submodule: 'Settlement Summary' },
      { title: 'Settlement History', path: '/admin/settlement/all', submodule: 'All Settlements' },
      { title: 'Calc Engine', path: '/admin/settlement/calculations', submodule: 'Settlement Calculations' },
    ],
  },
  {
    title: 'Insights',
    icon: ChartColumn,
    permissionModule: 'Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Turnover Pulse', path: '/admin/reports/merchant-turnover', submodule: 'overall reports' },
      { title: 'Partner Activity', path: '/admin/reports/merchant-transaction', submodule: 'Reports' },
      { title: 'MID Activity', path: '/admin/reports/mid-transaction', submodule: 'Reports' },
      { title: 'Payment Snapshot', path: '/admin/reports/transaction-summary', submodule: 'Reports' },
      { title: 'Country Pulse', path: '/admin/reports/country-wise-transaction', submodule: 'Reports' },
    ],
  },
  {
    title: 'System Setup',
    icon: Settings2,
    permissionModule: 'Master Module', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Regions', path: '/admin/master/countries', submodule: 'Countries' },
      { title: 'Currencies', path: '/admin/master/currency', submodule: 'Currency' },
      { title: 'Verticals', path: '/admin/master/industries', submodule: 'Industries' },
      { title: 'Contracts', path: '/admin/master/agreements', submodule: 'Agreements' },
      { title: 'Email Gateway', path: '/admin/smtp' },
    ],
  },
  {
    title: 'Care Desk',
    icon: LifeBuoy,
    permissionModule: 'Support', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Open Cases', path: '/admin/support/tickets', submodule: 'Tickets' },
      { title: 'Knowledge Base', path: '/admin/support/help-center', submodule: 'Help Center' },
    ],
  },
  {
    title: 'Activity Trail',
    icon: FileSearch,
    permissionModule: 'Logs', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Payment Trails', path: '/admin/log/txn_logs', submodule: 'Transaction Logs' },
      { title: 'Webhook Trails', path: '/admin/log/webhook_logs', submodule: 'Webhook Logs' },
      { title: 'Provider Trails', path: '/admin/log/provider_logs', submodule: 'Provider Logs' },
      { title: 'App Faults', path: '/admin/log/app_error_logs', submodule: 'App Error Logs' },
      { title: 'Job Faults', path: '/admin/log/job_error_logs', submodule: 'Job Error Logs' },
      { title: 'Cron Faults', path: '/admin/log/cron_error_logs', submodule: 'Cron Error Logs' },
      { title: 'Admin Trail', path: '/admin/log/admin_audit_logs', submodule: 'Admin Audit Logs' },
    ],
  },
  {
    title: 'Store Console',
    icon: Bolt,
    disabled: true,
    children: [
      { title: 'Store Hub', path: '/store-admin/dashboard' },
      {
        title: 'Stock Room',
        children: [
          {
            title: 'All Products',
            path: '/store-admin/inventory/all-products',
          },
          {
            title: 'Current Stock',
            path: '/store-admin/inventory/current-stock',
          },
          {
            title: 'Inbound Stock',
            path: '/store-admin/inventory/inbound-stock',
          },
          {
            title: 'Outbound Stock',
            path: '/store-admin/inventory/outbound-stock',
          },
          {
            title: 'Stock Planner',
            path: '/store-admin/inventory/stock-planner',
          },
          { title: 'Track Shipping', path: '/' },
          { title: 'Create Shipping Label', path: '/' },
        ],
      },
    ],
  },
  { title: 'Store Services', icon: Codepen, disabled: true },
  { title: 'AI Studio', icon: Theater, disabled: true },
  { title: 'Invoice Studio', icon: FileSearch, disabled: true },
];

/**
 * Get filtered admin menu based on user permissions
 * Only shows menu items for modules the user has access to
 *
 * @returns Filtered menu configuration
 */
export function getAdminMenu(): MenuConfig {
  // Filter menu items based on permissions
  // Dashboard is always shown, other items are filtered by module access
  return filterMenuByPermissions(BASE_ADMIN_MENU).filter((item) => !item.hidden);
}

/**
 * Admin menu (for backward compatibility)
 * This will be filtered automatically when used via getMenuByRole
 */
export const ADMIN_MENU: MenuConfig = BASE_ADMIN_MENU.filter((item) => !item.hidden);

export default ADMIN_MENU;
