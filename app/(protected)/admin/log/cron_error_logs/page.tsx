'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Clock } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const LogsContent = dynamic(
  () => import('../logs-content').then(mod => ({ default: mod.LogsContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function CronErrorLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Cron Error Logs"
            description="View scheduled cron job error logs and execution failures"
            icon={Clock}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="cron_error_logs" logTypeLabel="Cron Error Logs" />
      </Container>
    </Fragment>
  );
}

