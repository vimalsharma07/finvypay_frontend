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
    title: 'Overview',
    icon: LayoutDashboard,
    path: '/admin/dashboard',
    requirePermission: false, // Dashboard always visible
  },
  {
    title: 'Identity & Access',
    icon: UsersRound,
    permissionModule: 'User Management',
    requirePermission: true,
    children: [
      { title: 'Admin', path: '/admin/user-management/admin', submodule: 'Admin User' },
      { title: 'Merchant', path: '/admin/user-management/merchant', submodule: 'Merchant User' },
      { title: 'Affiliate', path: '/admin/user-management/affiliate', submodule: 'Affiliate User' },
    ],
  },
  {
    title: 'Payments',
    icon: WalletCards,
    permissionModule: 'Transactions',
    requirePermission: false,
    children: [
      { title: 'Transactions', path: '/admin/transactions/transactions', submodule: 'Transactions' },
      { title: 'Sanbox Transactions', path: '/admin/transactions/sandbox-transactions', submodule: 'Sanbox Transactions' },
    ],
  },
  {
    title: 'Access Control',
    icon: KeyRound,
    permissionModule: 'Roles & Permissions', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Roles', path: '/admin/roles-permissions/roles', submodule: 'Role' },
      { title: 'Permissions', path: '/admin/roles-permissions/permissions', submodule: 'Permission' },
    ],
  },
  {
    title: 'Risk Center',
    icon: ShieldAlert,
    permissionModule: 'Risk Management', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Manage Risk', path: '/admin/risk-compliance/manage-risk' }, // No specific submodule - shows if has any Risk Management permission
      { title: 'IP Allowlist', path: '/admin/risk-compliance/ip-allowlist', submodule: 'IP Whitelist' },
      { title: 'Trusted Cards', path: '/admin/risk-compliance/trusted-cards' }, // No specific submodule - shows if has any Risk Management permission
    ],
  },
  {
    title: 'Acquirers',
    icon: Building2,
    path: '/admin/acquirers',
    permissionModule: 'Acquirer Management', // Explicit permission module mapping
    requirePermission: true,
  },
  {
    title: 'Routing & Cascading',
    icon: Route,
    permissionModule: 'Routing',
    requirePermission: true,
    hidden: true, // Temporarily hidden from nav; pages under /admin/global-routing etc. remain available by URL
    children: [
      { title: 'Global Routing', path: '/admin/global-routing', submodule: 'Global Routing' },
      { title: 'Global Cascading', path: '/admin/global-cascading', submodule: 'Global Cascading' },
    ],
  },
  {
    title: 'Merchant Onboarding',
    icon: ClipboardCheck,
    path: '/admin/applications',
    permissionModule: 'Application Management', // Explicit permission module mapping
    requirePermission: false,
  },
  {
    title: 'Settlements',
    icon: CircleDollarSign,
    permissionModule: 'Settlement Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Settlement Summary', path: '/admin/settlement/summary', submodule: 'Settlement Summary' },
      { title: 'All Settlements', path: '/admin/settlement/all', submodule: 'All Settlements' },
      { title: 'Settlement Calculations', path: '/admin/settlement/calculations', submodule: 'Settlement Calculations' },
    ],
  },
  {
    title: 'Analytics',
    icon: ChartColumn,
    permissionModule: 'Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Merchant Turnover', path: '/admin/reports/merchant-turnover', submodule: 'overall reports' },
      { title: 'Merchant Transaction', path: '/admin/reports/merchant-transaction', submodule: 'Reports' },
      { title: 'MID Transaction', path: '/admin/reports/mid-transaction', submodule: 'Reports' },
      { title: 'Transaction Summary', path: '/admin/reports/transaction-summary', submodule: 'Reports' },
      { title: 'Country-wise Transaction', path: '/admin/reports/country-wise-transaction', submodule: 'Reports' },
    ],
  },
  {
    title: 'Configuration',
    icon: Settings2,
    permissionModule: 'Master Module', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Countries', path: '/admin/master/countries', submodule: 'Countries' },
      { title: 'Currency', path: '/admin/master/currency', submodule: 'Currency' },
      { title: 'Industries', path: '/admin/master/industries', submodule: 'Industries' },
      { title: 'Agreements', path: '/admin/master/agreements', submodule: 'Agreements' },
      { title: 'SMTP', path: '/admin/smtp' },
    ],
  },
  {
    title: 'Help Center',
    icon: LifeBuoy,
    permissionModule: 'Support', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Tickets', path: '/admin/support/tickets', submodule: 'Tickets' },
      { title: 'Help Center', path: '/admin/support/help-center', submodule: 'Help Center' },
    ],
  },
  {
    title: 'Audit Logs',
    icon: FileSearch,
    permissionModule: 'Logs', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Transaction Logs', path: '/admin/log/txn_logs', submodule: 'Transaction Logs' },
      { title: 'Webhook Logs', path: '/admin/log/webhook_logs', submodule: 'Webhook Logs' },
      { title: 'Provider Logs', path: '/admin/log/provider_logs', submodule: 'Provider Logs' },
      { title: 'App Error Logs', path: '/admin/log/app_error_logs', submodule: 'App Error Logs' },
      { title: 'Job Error Logs', path: '/admin/log/job_error_logs', submodule: 'Job Error Logs' },
      { title: 'Cron Error Logs', path: '/admin/log/cron_error_logs', submodule: 'Cron Error Logs' },
      { title: 'Admin Audit Logs', path: '/admin/log/admin_audit_logs', submodule: 'Admin Audit Logs' },
    ],
  },
  {
    title: 'Store - Admin',
    icon: Bolt,
    disabled: true,
    children: [
      { title: 'Dashboard', path: '/store-admin/dashboard' },
      {
        title: 'Inventory',
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
  { title: 'Store - Services', icon: Codepen, disabled: true },
  { title: 'AI Promt', icon: Theater, disabled: true },
  { title: 'Invoice Generator', icon: FileSearch, disabled: true },
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
