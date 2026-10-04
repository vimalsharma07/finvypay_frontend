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

const CascadingCreateContent = dynamic(
  () => import('./cascading-create-content').then(mod => ({ default: mod.CascadingCreateContent })),
  {
    loading: () => <FormSkeleton fields={5} />,
    ssr: false,
  }
);

export default function CreateCascadingPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Add Failover"
            description="Create a backup path when the primary bank partner cannot process"
            icon={Plus}
          />
        </Toolbar>
      </Container>
      <CascadingCreateContent />
    </Fragment>
  );
}
