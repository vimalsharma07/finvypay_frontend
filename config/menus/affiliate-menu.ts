import {
  Home,
  Users,
  CreditCard,
  FileText,
  Settings,
} from 'lucide-react';
import { type MenuConfig } from '../types';

export const AFFILIATE_MENU: MenuConfig = [
  {
    title: 'Dashboard',
    icon: Home,
    path: '/affiliate/dashboard',
  },
  {
    title: 'User Management',
    icon: Users,
    children: [
      { title: 'Merchant Users', path: '/affiliate/merchant' },
    ],
  },
  {
    title: 'Transactions',
    icon: CreditCard,
    children: [
      { title: 'All Transactions', path: '/affiliate/transactions' },
      { title: 'Pending', path: '/affiliate/transactions/pending' },
      { title: 'Completed', path: '/affiliate/transactions/completed' },
      { title: 'Failed', path: '/affiliate/transactions/failed' },
    ],
  },
  {
    title: 'Report',
    icon: FileText,
    children: [
      { title: 'Transaction Report', path: '/affiliate/reports/transactions' },
      { title: 'Financial Report', path: '/affiliate/reports/financial' },
      { title: 'User Report', path: '/affiliate/reports/users' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/affiliate/settings',
  },
];

export default AFFILIATE_MENU;

