'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Code } from 'lucide-react';
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

export default function ApiLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="API Logs"
            description="View API request and response logs with detailed payload information"
            icon={Code}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="api_logs" logTypeLabel="API Logs" />
      </Container>
    </Fragment>
  );
}

