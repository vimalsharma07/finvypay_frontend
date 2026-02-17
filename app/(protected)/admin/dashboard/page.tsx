'use client';

import { Fragment, useState } from 'react';
import dynamicImport from 'next/dynamic';
import { LayoutGrid } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { DateRange } from 'react-day-picker';
import { startOfYear, endOfYear } from 'date-fns';
import { MerchantFilter } from './merchant-filter';

// Dynamically import to avoid SSR issues with client-only code
const AdminDashboardContent = dynamicImport(
  () => import('./admin-dashboard-content').then(mod => ({ default: mod.AdminDashboardContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

const defaultDateRange = (): DateRange => {
  const today = new Date();
  return { from: startOfYear(today), to: endOfYear(today) };
};

/**
 * Admin Dashboard Page
 *
 * Displays admin-specific dashboard with user counters, transaction statistics, and connector summaries
 */
export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(defaultDateRange);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('all');

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Dashboard"
            description="Overview of system statistics, transaction analytics, user activity, and key performance metrics for administrative monitoring"
            icon={LayoutGrid}
          />
          <ToolbarActions>
            <MerchantFilter value={selectedMerchantId} onChange={setSelectedMerchantId} />
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              defaultRange={defaultDateRange()}
              placeholder="Select from and to date"
              numberOfMonths={2}
            />
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <AdminDashboardContent dateRange={dateRange} merchantId={selectedMerchantId} />
      </Container>
    </Fragment>
  );
}

