'use client';

import { Fragment, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { UserDashboardContent } from './components';
import { DateRange } from 'react-day-picker';
import { startOfMonth, endOfMonth } from 'date-fns';

const defaultDateRange = (): DateRange => {
  const today = new Date();
  return { from: startOfMonth(today), to: endOfMonth(today) };
};

/**
 * User Dashboard Page
 *
 * Dedicated dashboard for user role with user-specific statistics and quick actions
 */
export default function UserDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => defaultDateRange());

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Dashboard"
            description="Overview of your payment transactions, account activity, revenue analytics, and key performance metrics"
            icon={LayoutGrid}
          />
          <ToolbarActions>
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
        <UserDashboardContent dateRange={dateRange} />
      </Container>
    </Fragment>
  );
}
