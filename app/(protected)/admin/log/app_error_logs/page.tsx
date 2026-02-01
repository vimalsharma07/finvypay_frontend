'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { AlertCircle } from 'lucide-react';
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

export default function AppErrorLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="App Error Logs"
            description="View application error logs and exception details"
            icon={AlertCircle}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="app_error_logs" logTypeLabel="App Error Logs" />
      </Container>
    </Fragment>
  );
}

