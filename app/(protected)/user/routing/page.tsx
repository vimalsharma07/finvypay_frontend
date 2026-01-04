'use client';

import dynamic from 'next/dynamic';
import { Route } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const UserRoutingPageContent = dynamic(
  () => import('./routing-content').then(mod => ({ default: mod.UserRoutingPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function UserRoutingPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Routing Rules"
          description="Create, edit, and manage payment routing rules to optimize transaction processing across multiple acquirers"
          icon={Route}
        />
      </Toolbar>
      <UserRoutingPageContent />
    </Container>
  );
}

