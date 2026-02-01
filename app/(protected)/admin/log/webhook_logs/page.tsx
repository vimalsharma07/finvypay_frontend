'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Webhook } from 'lucide-react';
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

export default function WebhookLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Webhook Logs"
            description="View webhook event logs with payload and response details"
            icon={Webhook}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="webhook_logs" logTypeLabel="Webhook Logs" />
      </Container>
    </Fragment>
  );
}

