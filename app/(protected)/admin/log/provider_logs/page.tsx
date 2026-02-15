'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Plug } from 'lucide-react';
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

export default function ProviderLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Provider Logs"
            description="View provider and acquirer integration logs with request and response details"
            icon={Plug}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="provider_logs" logTypeLabel="Provider Logs" />
      </Container>
    </Fragment>
  );
}
