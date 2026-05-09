'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Briefcase } from 'lucide-react';
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

export default function JobErrorLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Job Error Logs"
            description="View background job error logs and processing failures"
            icon={Briefcase}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="job_error_logs" logTypeLabel="Job Error Logs" />
      </Container>
    </Fragment>
  );
}

