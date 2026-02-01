'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Shield } from 'lucide-react';
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

export default function AdminAuditLogsPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Admin Audit Logs"
            description="View admin action audit logs and administrative activity records"
            icon={Shield}
          />
        </Toolbar>
      </Container>
      <Container>
        <LogsContent logType="admin_audit_logs" logTypeLabel="Admin Audit Logs" />
      </Container>
    </Fragment>
  );
}

