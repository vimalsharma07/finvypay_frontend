'use client';

import dynamic from 'next/dynamic';
import { Plug } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const AcquirersPageContent = dynamic(
  () => import('./acquirers-content').then(mod => ({ default: mod.AcquirersPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminAcquirersPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Acquirers"
          description="Create, edit, and manage payment gateway acquirers with configuration settings and account management"
          icon={Plug}
        />
      </Toolbar>
      <AcquirersPageContent />
    </Container>
  );
}

