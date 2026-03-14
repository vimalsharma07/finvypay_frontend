/**
 * Affiliate module API routes
 * Used by affiliate dashboard (merchant users, transactions, etc.)
 */

import { affiliateDashboardRoutes } from './dashboard-routes';
import { affiliateMerchantRoutes } from './merchant-routes';
import { affiliateOnboardingRoutes } from './onboarding-routes';
import { affiliateProfileRoutes } from './profile-routes';
import { affiliateTransactionRoutes } from './transaction-routes';

export const affiliateRoutes = {
  dashboard: affiliateDashboardRoutes,
  merchant: affiliateMerchantRoutes,
  onboarding: affiliateOnboardingRoutes,
  profile: affiliateProfileRoutes,
  transactions: affiliateTransactionRoutes,
} as const;
