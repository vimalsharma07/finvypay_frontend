'use client';

import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const RoutingCreateContent = dynamic(
  () => import('./routing-create-content').then(mod => ({ default: mod.RoutingCreateContent })),
  {
    loading: () => <FormSkeleton fields={8} />,
    ssr: false,
  }
);

export default function CreateRoutingPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Routing Rule"
          description="Configure routing rules to optimize payment processing across multiple acquirers"
          icon={Plus}
        />
      </Toolbar>
      <RoutingCreateContent />
    </Container>
  );
}
