'use client';

import dynamic from 'next/dynamic';
import { Link2 } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const UserCascadingPageContent = dynamic(
  () => import('./cascading-content').then(mod => ({ default: mod.UserCascadingPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function UserCascadingPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Cascading Rules"
          description="View and manage cascading payment rules that automatically route transactions through multiple acquirers in sequence"
          icon={Link2}
        />
      </Toolbar>
      <UserCascadingPageContent />
    </Container>
  );
}


