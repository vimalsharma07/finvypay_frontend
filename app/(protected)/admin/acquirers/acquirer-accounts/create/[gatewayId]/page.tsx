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

const CreateAcquirerAccountContent = dynamic(
  () => import('./create-acquirer-account-content').then(mod => ({ default: mod.CreateAcquirerAccountContent })),
  {
    loading: () => <FormSkeleton fields={10} />,
    ssr: false,
  }
);

export default function AdminCreateAcquirerAccountPage() {
  const router = useRouter();

  return (
    <Suspense>
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Create Acquirer Account"
              description="Create a new payment gateway acquirer account with connection settings, credentials, and configuration parameters"
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
        <CreateAcquirerAccountContent />
      </Fragment>
    </Suspense>
  );
}

