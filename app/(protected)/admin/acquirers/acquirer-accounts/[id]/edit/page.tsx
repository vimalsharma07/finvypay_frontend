'use client';

import dynamic from 'next/dynamic';
import { Cpu } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

const EditAcquirerAccountContent = dynamic(
  () => import('./edit-acquirer-account-content').then(mod => ({ default: mod.EditAcquirerAccountContent })),
  {
    loading: () => <FormSkeleton fields={15} />,
    ssr: false,
  }
);

export default function AdminEditAcquirerAccountPage() {
  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Update Connector"
            description="Update payment gateway acquirer account connection settings, credentials, and configuration parameters"
            icon={Cpu}
          />
        </Toolbar>
      </Container>
      <EditAcquirerAccountContent />
    </Suspense>
  );
}

