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
      
    ],
  },
  {
    title: 'Settlement Report',
    icon: FileText,
    path: '/affiliate/reports/settlement',
  },
  {
    title: 'Settings',
    icon: Settings,
    children: [
      { title: 'Profile', path: '/affiliate/profile' },
    ],
  },
];

export default AFFILIATE_MENU;

