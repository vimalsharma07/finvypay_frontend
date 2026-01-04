'use client';

import dynamic from 'next/dynamic';
import { Cpu } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

const CreateAcquirerAccountContent = dynamic(
  () => import('./create-acquirer-account-content').then(mod => ({ default: mod.CreateAcquirerAccountContent })),
  {
    loading: () => <FormSkeleton fields={10} />,
    ssr: false,
  }
);

export default function AdminCreateAcquirerAccountPage() {
  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Create Acquirer Account"
            description="Create a new payment gateway acquirer account with connection settings, credentials, and configuration parameters"
            icon={Cpu}
          />
        </Toolbar>
      </Container>
      <CreateAcquirerAccountContent />
    </Suspense>
  );
}

