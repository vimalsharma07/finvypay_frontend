'use client';

import { Fragment } from 'react';
import dynamicImport from 'next/dynamic';
import { LayoutGrid } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

// Dynamically import to avoid SSR issues with client-only code
const AdminDashboardContent = dynamicImport(
  () => import('./admin-dashboard-content').then(mod => ({ default: mod.AdminDashboardContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

/**
 * Admin Dashboard Page
 * 
 * Displays admin-specific dashboard with user counters, transaction statistics, and connector summaries
 */
export default function AdminDashboardPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Dashboard"
            description="Overview of system statistics, transaction analytics, user activity, and key performance metrics for administrative monitoring"
            icon={LayoutGrid}
          />
        </Toolbar>
      </Container>
      <Container>
        <AdminDashboardContent />
      </Container>
    </Fragment>
  );
}

