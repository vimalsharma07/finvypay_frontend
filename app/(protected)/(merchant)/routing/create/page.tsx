'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
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
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Add Route"
            description="Create a new path for sending payments to a bank partner"
            icon={Plus}
          />
        </Toolbar>
      </Container>
      <RoutingCreateContent />
    </Fragment>
  );
}
