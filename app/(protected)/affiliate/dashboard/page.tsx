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
import { DateRange } from 'react-day-picker';
import { AffiliateDashboardContent } from './components';

/**
 * Affiliate Dashboard Page
 * Overview of referred merchants' transaction statistics.
 * Default: no date filter applied. Optional date range in toolbar.
 */
export default function AffiliateDashboardPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Dashboard"
            description="Overview of referred merchants' transaction statistics, success and decline rates, and connector performance"
            icon={LayoutGrid}
          />
          <ToolbarActions>
            <DateRangeFilter
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select from and to date (optional)"
              numberOfMonths={2}
            />
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <AffiliateDashboardContent dateRange={dateRange} />
      </Container>
    </Fragment>
  );
}
