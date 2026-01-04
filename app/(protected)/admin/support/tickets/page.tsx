'use client';

import dynamic from 'next/dynamic';
import { LifeBuoy } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const SupportTicketsPageContent = dynamic(
  () => import('./tickets-content').then(mod => ({ default: mod.SupportTicketsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function SupportTicketsPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Support Tickets"
          description="View, respond to, and manage customer support tickets with status tracking and resolution management"
          icon={LifeBuoy}
        />
      </Toolbar>
      <SupportTicketsPageContent />
    </Container>
  );
}

