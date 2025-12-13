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

export const USER_MENU: MenuConfig = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/user/dashboard',
  },
  {
    title: 'Connectors',
    icon: Cpu,
    path: '/user/connectors',
  },
  {
    title: 'Wallet',
    icon: Wallet,
    path: '/user/wallet',
  },
  {
    title: 'User Management',
    icon: Users,
    path: '/user/user-management',
  },
  {
    title: 'Transactions',
    icon: CircleDollarSign,
    children: [
      { title: 'All Transactions', path: '/user/transactions' },
      { title: 'Pending Transactions', path: '/user/transactions/pending' },
      { title: 'Completed Transactions', path: '/user/transactions/completed' },
      { title: 'Failed Transactions', path: '/user/transactions/failed' },
    ],
  },
  {
    title: 'Risk & Compliance',
    icon: FileBarChart,
    children: [
      { title: 'Manage Risk', path: '/user/risk-compliance/manage-risk' },
      { title: 'IP Allowlist', path: '/user/risk-compliance/ip-allowlist' },
      { title: 'Trusted Cards', path: '/user/risk-compliance/trusted-cards' },
    ],
  },
  {
    title: 'Routing',
    icon: Route,
    path: '/user/routing',
  },
  {
    title: 'Payment Links',
    icon: Link2,
    path: '/user/payment-links',
  },
  {
    title: 'Cascading',
    icon: BarChart3,
    path: '/user/cascading',
  },
  {
    title: 'Support',
    icon: Heart,
    path: '/user/support',
  },
  {
    title: 'Report',
    icon: FileText,
    children: [
      { title: 'Daily Report', path: '/user/reports/daily' },
      { title: 'Monthly Report', path: '/user/reports/monthly' },
    ],
  },
  {
    title: 'Payout Reports',
    icon: Receipt,
    children: [
      { title: 'All Payouts', path: '/user/payouts/all' },
      { title: 'Pending Payouts', path: '/user/payouts/pending' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/user/settings',
  },
];

export default USER_MENU;
