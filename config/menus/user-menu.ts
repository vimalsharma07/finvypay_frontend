import {
  BarChart3,
  BookOpen,
  ChartColumn,
  CircleDollarSign,
  Cpu,
  LayoutDashboard,
  LifeBuoy,
  Link2,
  Receipt,
  Route,
  Settings,
  ShieldAlert,
  Wallet,
  WalletCards,
} from 'lucide-react';
import { type MenuConfig } from '../types';
import { filterMenuByPermissions } from '@/lib/utils/permission-menu-matcher';
import { generalSettings } from '../general.config';

// Base user menu configuration (before permission filtering)
const BASE_USER_MENU: MenuConfig = [
  {
    title: 'Home Hub',
    icon: LayoutDashboard,
    path: '/dashboard',
    requirePermission: false, // Dashboard always visible
  },
  {
    title: 'Bank Connections',
    icon: Cpu,
    permissionModule: 'Acquirer Accounts',
    requirePermission: false,
    children: [
      { title: 'Connected Banks', path: '/acquirer-accounts', submodule: 'aquirer accounts' },
      { title: 'Bank Requests', path: '/acquirer-requests', submodule: 'Aquire Requests' },
     
    ],
  },
  {
    title: 'Balance Vault',
    icon: Wallet,
    path: '/wallet',
    permissionModule: 'Wallet Management',
    requirePermission: true,
  },
  {
    title: 'Money Flow',
    icon: WalletCards,
    permissionModule: 'Transactions',
    requirePermission: false,
    children: [
      { title: 'Live Activity', path: '/transactions', submodule: 'Transactions' },
      { title: 'Test Activity', path: '/transactions/sandbox-transactions', submodule: ' Sandbox Transactions' },
     
    ],
  },
  {
    title: 'Fraud Shield',
    icon: ShieldAlert,
    permissionModule: 'Risk Management',
    requirePermission: false,
    children: [
      { title: 'Risk Rules', path: '/risk-compliance/manage-risk' },
      { title: 'Trusted IPs', path: '/risk-compliance/ip-allowlist', submodule: 'IP Whitelist' },
      { title: 'Safe Cards', path: '/risk-compliance/trusted-cards' },
    ],
  },
  {
    title: 'Smart Routing',
    icon: Route,
    permissionModule: 'Routing Management',
    requirePermission: false,
    children: [
      { title: 'Route Map', path: '/routing', submodule: 'Routing' },
      { title: 'Failover Paths', path: '/cascading', submodule: 'Cascading' },
    ],
  },
  {
    title: 'Pay Links',
    icon: Link2,
    path: '/payment-links',
    permissionModule: 'Payment Links',
    requirePermission: true,
  },
  {
    title: 'Failover Paths',
    icon: BarChart3,
    path: '/cascading',
    permissionModule: 'Cascading Management',
    requirePermission: true,
  },
  {
    title: 'Pay Links',
    icon: Link2,
    path: '/payment-links',
    permissionModule: 'Payment Links',
    requirePermission: false,
  },
  {
    title: 'Fund Desk',
    icon: CircleDollarSign,
    permissionModule: 'Settlement Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      { title: 'Settlement History', path: '/settlement/all', submodule: 'All Settlements' },
    ],
  },
  {
    title: 'Insights',
    icon: ChartColumn,
    permissionModule: 'Reports',
    requirePermission: false,
    children: [
      { title: 'Turnover Pulse', path: '/reports/merchant-turnover', submodule: 'Reports' },
      { title: 'Payment Snapshot', path: '/reports/transaction-summary', submodule: 'Reports' },
      { title: 'BIN Pulse', path: '/reports/bin-wise-transaction', submodule: 'Reports' },
    ],
  },
  {
    title: 'Care Desk',
    icon: LifeBuoy,
    path: '/support',
    permissionModule: 'Support',
    requirePermission: false,
  },
 
  {
    title: 'Payout Desk',
    icon: Receipt,
    permissionModule: 'Payout Reports',
    requirePermission: true,
    children: [
      { title: 'All Payouts', path: '/payouts/all', submodule: 'Payout Reports' },
      { title: 'Waiting Payouts', path: '/payouts/pending', submodule: 'Payout Reports' },
    ],
  },
  {
    title: 'Workspace',
    icon: Settings,
    path: '/settings',
    requirePermission: false,
    children: [
      { title: 'Rate Card', path: '/rates', submodule: 'Rates' },
      { title: 'Preferences', path: '/config', submodule: 'Config' },
    ],
  },
  {
    title: 'Developer Guide',
    icon: BookOpen,
    path: generalSettings.docsLink,
    requirePermission: false,
  },
];

/**
 * Get filtered user menu based on user permissions
 * Only shows menu items for modules the user has access to
 * 
 * @returns Filtered menu configuration
 */
export function getUserMenu(): MenuConfig {
  // Filter menu items based on permissions
  // Dashboard and Settings are always shown, other items are filtered by module access
  return filterMenuByPermissions(BASE_USER_MENU);
}

/**
 * User menu (for backward compatibility)
 * This will be filtered automatically when used via getMenuByRole
 */
export const USER_MENU: MenuConfig = BASE_USER_MENU;

export default USER_MENU;
