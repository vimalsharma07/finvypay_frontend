'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { LifeBuoy } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const SupportPageContent = dynamic(
  () => import('./support-content').then(mod => ({ default: mod.SupportPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function SupportPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Support"
            description="Create, view, and manage your support tickets with status tracking and communication history"
            icon={LifeBuoy}
          />
        </Toolbar>
      </Container>
      <SupportPageContent />
    </Fragment>
  );
}

