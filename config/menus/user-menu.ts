import {
  Home,
  Cpu,
  Wallet,
  Users,
  CircleDollarSign,
  FileBarChart,
  Route,
  Link2,
  BarChart3,
  Heart,
  FileText,
  Receipt,
  Settings,
} from 'lucide-react';
import { type MenuConfig } from '../types';
import { filterMenuByPermissions } from '@/lib/utils/permission-menu-matcher';

// Base user menu configuration (before permission filtering)
const BASE_USER_MENU: MenuConfig = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/user/dashboard',
    requirePermission: false, // Dashboard always visible
  },
  {
    title: 'Connectors',
    icon: Cpu,
    path: '/user/connectors',
    permissionModule: 'Connector Management',
    requirePermission: true,
  },
  {
    title: 'Wallet',
    icon: Wallet,
    path: '/user/wallet',
    permissionModule: 'Wallet Management',
    requirePermission: true,
  },
  {
    title: 'User Management',
    icon: Users,
    path: '/user/user-management',
    permissionModule: 'User Management',
    requirePermission: true,
  },
  {
    title: 'Transactions',
    icon: CircleDollarSign,
    permissionModule: 'Transactions',
    requirePermission: false,
    children: [
      { title: 'All Transactions', path: '/user/transactions', submodule: 'Transactions' },
      { title: 'Pending Transactions', path: '/user/transactions/pending', submodule: 'Transactions' },
      { title: 'Completed Transactions', path: '/user/transactions/completed', submodule: 'Transactions' },
      { title: 'Failed Transactions', path: '/user/transactions/failed', submodule: 'Transactions' },
    ],
  },
  {
    title: 'Risk & Compliance',
    icon: FileBarChart,
    permissionModule: 'Risk Management',
    requirePermission: false,
    children: [
      { title: 'Manage Risk', path: '/user/risk-compliance/manage-risk' },
      { title: 'IP Allowlist', path: '/user/risk-compliance/ip-allowlist', submodule: 'IP Whitelist' },
      { title: 'Trusted Cards', path: '/user/risk-compliance/trusted-cards' },
    ],
  },
  {
    title: 'Routing',
    icon: Route,
    path: '/user/routing',
    permissionModule: 'Routing Management',
    requirePermission: true,
  },
  {
    title: 'Payment Links',
    icon: Link2,
    path: '/user/payment-links',
    permissionModule: 'Payment Links',
    requirePermission: true,
  },
  {
    title: 'Cascading',
    icon: BarChart3,
    path: '/user/cascading',
    permissionModule: 'Cascading Management',
    requirePermission: true,
  },
  {
    title: 'Support',
    icon: Heart,
    path: '/user/support',
    permissionModule: 'Support',
    requirePermission: true,
  },
  {
    title: 'Report',
    icon: FileText,
    permissionModule: 'Reports',
    requirePermission: true,
    children: [
      { title: 'Daily Report', path: '/user/reports/daily', submodule: 'Reports' },
      { title: 'Monthly Report', path: '/user/reports/monthly', submodule: 'Reports' },
    ],
  },
  {
    title: 'Payout Reports',
    icon: Receipt,
    permissionModule: 'Payout Reports',
    requirePermission: true,
    children: [
      { title: 'All Payouts', path: '/user/payouts/all', submodule: 'Payout Reports' },
      { title: 'Pending Payouts', path: '/user/payouts/pending', submodule: 'Payout Reports' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/user/settings',
    requirePermission: false, // Settings always visible
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
