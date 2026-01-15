'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3 } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const ReportsPageContent = dynamic(
  () => import('./reports-content').then(mod => ({ default: mod.ReportsContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function ReportsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Reports"
            description="View merchant turnover reports with transaction statistics, success rates, and performance metrics"
            icon={BarChart3}
          />
        </Toolbar>
      </Container>
      <Container>
        <ReportsPageContent />
      </Container>
    </Fragment>
  );
}

