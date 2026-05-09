import {
  BarChart3,
  Bolt,
  ClipboardList,
  Codepen,
  CreditCard,
  Database,
  FileText,
  LayoutGrid,
  LifeBuoy,
  Plug,
  Route,
  ScrollText,
  ShieldCheck,
  ShieldUser,
  Theater,
  Users,
} from 'lucide-react';
import { type MenuConfig } from '../types';
import { filterMenuByPermissions } from '@/lib/utils/permission-menu-matcher';

// Base admin menu configuration (before permission filtering)
const BASE_ADMIN_MENU: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    path: '/admin/dashboard',
    requirePermission: false, // Dashboard always visible
  },
  // { heading: 'User' },
  {
    title: 'User Management',
    icon: Users,
    permissionModule: 'User Management',
    requirePermission: true,
    children: [
      { title: 'Admin', path: '/admin/user-management/admin', submodule: 'Admin User' },
      { title: 'Merchant', path: '/admin/user-management/merchant', submodule: 'Merchant User' },
      { title: 'Affiliate', path: '/admin/user-management/affiliate', submodule: 'Affiliate User' },
    ],
  },
  {
    title: 'Transactions',
    icon: CreditCard,
    permissionModule: 'Transactions', 
    requirePermission: false,
    children: [
      { title: 'Transactions', path: '/admin/transactions/transactions', submodule: 'Transactions' },
      { title: 'Sanbox Transactions', path: '/admin/transactions/sandbox-transactions', submodule: 'Sanbox Transactions' },
    ],
  },
  {
    title: 'Roles & Permissions',
    icon: ShieldUser,
    permissionModule: 'Roles & Permissions', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Roles', path: '/admin/roles-permissions/roles', submodule: 'Role' },
      { title: 'Permissions', path: '/admin/roles-permissions/permissions', submodule: 'Permission' },
    ],
  },
  {
    title: 'Risk & Compliance',
    icon: ShieldCheck,
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
    icon: Plug,
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
    title: 'Applications & Requests',
    icon: ClipboardList,
    path: '/admin/applications',
    permissionModule: 'Application Management', // Explicit permission module mapping
    requirePermission: false,
  },
  {
    title: 'Settlement Reports',
    icon: BarChart3,
    permissionModule: 'Settlement Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      {title: 'Settlement Summary', path: '/admin/settlement/summary', submodule: 'Settlement Summary' },
      { title: 'All Settlements', path: '/admin/settlement/all', submodule: 'All Settlements' },
      {title: 'Settlement Calculations', path: '/admin/settlement/calculations', submodule: 'Settlement Calculations' },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    permissionModule: 'Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Merchant Turnover', path: '/admin/reports/merchant-turnover', submodule: 'overall reports' },
      { title: 'Merchant Transaction', path: '/admin/reports/merchant-transaction', submodule: 'Reports' },
      { title: 'MID Transaction', path: '/admin/reports/mid-transaction', submodule: 'Reports' },
      { title: 'Transaction Summary', path: '/admin/reports/transaction-summary', submodule: 'Reports' },
      { title: 'Merchant Transaction Response', path: '/admin/reports/merchant-transaction-response', submodule: 'Reports' },
      { title: 'Country-wise Transaction', path: '/admin/reports/country-wise-transaction', submodule: 'Reports' },
      { title: 'BIN-wise Transaction', path: '/admin/reports/bin-wise-transaction', submodule: 'Reports' },
      { title: 'Provider Rates', path: '/admin/reports/provider-rates', submodule: 'Reports' },
    ],
  },
  {
    title: 'Master',
    icon: Database,
    permissionModule: 'Master Module', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Countries', path: '/admin/master/countries', submodule: 'Countries' },
      { title: 'Currency', path: '/admin/master/currency', submodule: 'Currency' },
      { title: 'Industries', path: '/admin/master/industries', submodule: 'Industries' },
      { title: 'Agreements', path: '/admin/master/agreements', submodule: 'Agreements' },

    ],
  },
 
  {
    title: 'Support',
    icon: LifeBuoy,
    permissionModule: 'Support', // Explicit permission module mapping
    requirePermission: true,
    children: [
      { title: 'Tickets', path: '/admin/support/tickets', submodule: 'Tickets' },
      { title: 'Help Center', path: '/admin/support/help-center', submodule: 'Help Center' },
    ],
  },
  {
    title: 'Logs',
    icon: ScrollText,
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
  { title: 'Invoice Generator', icon: ScrollText, disabled: true },
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

