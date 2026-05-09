'use client';

import dynamic from 'next/dynamic';
import { Link2 } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

const RequestsContent = dynamic(
  () => import('./requests-content').then(mod => ({ default: mod.RequestsContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminAcquirerRequestsPage() {
  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Acquirer Requests"
            description="Manage merchant acquirer account requests and approvals"
            icon={Link2}
          />
        </Toolbar>
      </Container>
      <RequestsContent />
    </Suspense>
  );
}
