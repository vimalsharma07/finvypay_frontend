'use client';

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
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Cascading Rule"
          description="Configure cascading rules to automatically route transactions through multiple acquirers in sequence"
          icon={Plus}
        />
      </Toolbar>
      <CascadingCreateContent />
    </Container>
  );
}
