'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';
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

export default function TransactionLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Transaction Logs"
            description="View detailed transaction logs with payload, response, and error information"
            icon={FileText}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="txn_logs" logTypeLabel="Transaction Logs" />
      </Container>
    </Fragment>
  );
}

