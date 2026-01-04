'use client';

import dynamicImport from 'next/dynamic';
import { PageSkeleton } from '@/components/ui/skeletons';

// Dynamically import to avoid SSR issues with client-only code
const Demo1LightSidebarPage = dynamicImport(
  () => import('@/app/(protected)/components/demo1').then(mod => ({ default: mod.Demo1LightSidebarPage })),
  { 
    ssr: false,
    loading: () => <PageSkeleton />,
  }
);

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';

/**
 * Admin Dashboard Page
 * 
 * Uses the original dashboard content - only the sidebar menu changes based on role
 */
export default function AdminDashboardPage() {
  return <Demo1LightSidebarPage />;
}

