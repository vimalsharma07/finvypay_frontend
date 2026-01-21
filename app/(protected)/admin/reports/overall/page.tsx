'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3 } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

// Dynamically import the heavy content
const OverallReportsContent = dynamic(
  () => import('./overall-reports-content').then(mod => ({ default: mod.OverallReportsContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function OverallReportsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Overall Reports"
            description="View merchant turnover reports with transaction statistics, success rates, and performance metrics"
            icon={BarChart3}
          />
          <ToolbarActions>
            {/* Reserved for future actions like export, download, etc. */}
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <OverallReportsContent />
      </Container>
    </Fragment>
  );
}

