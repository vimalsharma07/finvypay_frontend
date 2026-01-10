'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { Link2, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

const UserCascadingPageContent = dynamic(
  () => import('./cascading-content').then(mod => ({ default: mod.UserCascadingPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function UserCascadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Cascading Rules"
            description="View and manage cascading payment rules that automatically route transactions through multiple acquirers in sequence"
            icon={Link2}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => router.push(`/cascading/create${profileId ? `?profileId=${profileId}` : ''}`)}
            >
              <Plus className="h-4 w-4" />
              Create Cascading
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <UserCascadingPageContent />
    </Fragment>
  );
}


