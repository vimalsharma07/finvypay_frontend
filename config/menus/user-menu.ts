import {
  Home,
  Cpu,
  Wallet,
  CircleDollarSign,
  FileBarChart,
  Route,
  Link2,
  BarChart3,
  Heart,
  FileText,
  Receipt,
  Settings,
  BookOpen,
} from 'lucide-react';
import { type MenuConfig } from '../types';
import { filterMenuByPermissions } from '@/lib/utils/permission-menu-matcher';
import { generalSettings } from '../general.config';

// Base user menu configuration (before permission filtering)
const BASE_USER_MENU: MenuConfig = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/dashboard',
    requirePermission: false, // Dashboard always visible
  },
  {
    title: 'Acquirer Accounts',
    icon: Cpu,
    permissionModule: 'Acquirer Accounts',
    requirePermission: false,
    children: [
      { title: ' Aquirer Accounts', path: '/acquirer-accounts', submodule: 'aquirer accounts' },
      { title: 'Aquire Requests', path: '/acquirer-requests', submodule: 'Aquire Requests' },
     
    ],
  },
  {
    title: 'Wallet',
    icon: Wallet,
    path: '/wallet',
    permissionModule: 'Wallet Management',
    requirePermission: true,
  },
  {
    title: 'Transactions',
    icon: CircleDollarSign,
    permissionModule: 'Transactions',
    requirePermission: false,
    children: [
      { title: ' Transactions', path: '/transactions', submodule: 'Transactions' },
      { title: 'Sandbox Transactions', path: '/transactions/sandbox-transactions', submodule: ' Sandbox Transactions' },
     
    ],
  },
  {
    title: 'Risk & Compliance',
    icon: FileBarChart,
    permissionModule: 'Risk Management',
    requirePermission: false,
    children: [
      { title: 'Manage Risk', path: '/risk-compliance/manage-risk' },
      { title: 'IP Allowlist', path: '/risk-compliance/ip-allowlist', submodule: 'IP Whitelist' },
      { title: 'Trusted Cards', path: '/risk-compliance/trusted-cards' },
    ],
  },
  {
    title: 'Routing & Cascading',
    icon: Route,
    permissionModule: 'Routing Management',
    requirePermission: false,
    children: [
      { title: 'Routing', path: '/routing', submodule: 'Routing' },
      { title: 'Cascading', path: '/cascading', submodule: 'Cascading' },
    ],
  },
  {
    title: 'Payment Links',
    icon: Link2,
    path: '/payment-links',
    permissionModule: 'Payment Links',
    requirePermission: true,
  },
  {
    title: 'Cascading',
    icon: BarChart3,
    path: '/cascading',
    permissionModule: 'Cascading Management',
    requirePermission: true,
  },
  {
    title: 'Payment Links',
    icon: Link2,
    path: '/payment-links',
    permissionModule: 'Payment Links',
    requirePermission: false,
  },
  {
    title: 'Settlement Reports',
    icon: BarChart3,
    permissionModule: 'Settlement Reports', // Explicit permission module mapping
    requirePermission: false,
    children: [
      {title: 'Settlement Summary', path: '/settlement/summary', submodule: 'Settlement Summary' },
      { title: 'All Settlements', path: '/settlement/all', submodule: 'All Settlements' },
      { title: 'Balances History', path: '/settlement/balances', submodule: 'Balances History' },
    ],
  },
  {
    title: 'Reports',
    icon: FileText,
    permissionModule: 'Reports',
    requirePermission: false,
    children: [
      { title: 'Overall Turnover', path: '/reports/merchant-turnover', submodule: 'Reports' },
      { title: 'Transaction Summary', path: '/reports/transaction-summary', submodule: 'Reports' },
      { title: 'BIN-wise Transaction', path: '/reports/bin-wise-transaction', submodule: 'Reports' },
    ],
  },
  {
    title: 'Support',
    icon: Heart,
    path: '/support',
    permissionModule: 'Support',
    requirePermission: false,
  },
 
  {
    title: 'Payout Reports',
    icon: Receipt,
    permissionModule: 'Payout Reports',
    requirePermission: true,
    children: [
      { title: 'All Payouts', path: '/payouts/all', submodule: 'Payout Reports' },
      { title: 'Pending Payouts', path: '/payouts/pending', submodule: 'Payout Reports' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
    requirePermission: false, 
    children: [
      { title: ' Global rate', path: '/rates', submodule: 'Rates' },     
    ],
  },
  {
    title: 'Docs',
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
