'use client';

import dynamicImport from 'next/dynamic';

// Dynamically import to avoid SSR issues with client-only code
const DashboardPage = dynamicImport(
  () => import('@/app/(protected)/components/dashboard').then(mod => ({ default: mod.DashboardPage })),
  { ssr: false }
);

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

/**
 * Affiliate Dashboard Page
 * 
 * Uses the original dashboard content - only the sidebar menu changes based on role
 */
export default function AffiliateDashboardPage() {
  return <DashboardPage />;
}

