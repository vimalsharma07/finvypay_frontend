'use client';

import dynamic from 'next/dynamic';
import { Plug } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreateAcquirerContent = dynamic(
  () => import('./create-acquirer-content').then(mod => ({ default: mod.CreateAcquirerContent })),
  {
    loading: () => <FormSkeleton fields={8} />,
    ssr: false,
  }
);

export default function CreateAcquirerPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Acquirer"
          description="Create a new payment gateway acquirer with name, configuration settings, and integration details"
          icon={Plug}
        />
      </Toolbar>
      <CreateAcquirerContent />
    </Container>
  );
}

