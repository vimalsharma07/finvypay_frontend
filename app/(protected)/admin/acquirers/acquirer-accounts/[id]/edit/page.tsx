'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Cpu, ArrowLeft } from 'lucide-react';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const EditAcquirerAccountContent = dynamic(
  () => import('./edit-acquirer-account-content').then(mod => ({ default: mod.EditAcquirerAccountContent })),
  {
    loading: () => <FormSkeleton fields={15} />,
    ssr: false,
  }
);

export default function AdminEditAcquirerAccountPage() {
  const router = useRouter();

  return (
    <Suspense>
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Update Connector"
              description="Update payment gateway acquirer account connection settings, credentials, and configuration parameters"
              icon={Cpu}
            />
            <ToolbarActions>
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <EditAcquirerAccountContent />
      </Fragment>
    </Suspense>
  );
}

