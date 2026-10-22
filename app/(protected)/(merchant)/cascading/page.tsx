'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { Link2, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';
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

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Failover Paths"
            description="Set backup bank partners when the primary path declines"
            icon={Link2}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              className="rounded-xl shadow-sm shadow-sky-500/20"
              onClick={() => router.push('/cascading/create')}
            >
              <Plus className="h-4 w-4" />
              Add Failover
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <UserCascadingPageContent />
    </Fragment>
  );
}


