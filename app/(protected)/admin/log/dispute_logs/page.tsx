'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { AlertTriangle } from 'lucide-react';
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

export default function DisputeLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Dispute Logs"
            description="View dispute-related logs and transaction dispute information"
            icon={AlertTriangle}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="dispute_logs" logTypeLabel="Dispute Logs" />
      </Container>
    </Fragment>
  );
}

