'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { Route, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const UserRoutingPageContent = dynamic(
  () => import('./routing-content').then(mod => ({ default: mod.UserRoutingPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function UserRoutingPage() {
  const router = useRouter();

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Route Map"
            description="Direct payments to the right bank partner with simple priority rules"
            icon={Route}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              className="rounded-xl shadow-sm shadow-sky-500/20"
              onClick={() => router.push('/routing/create')}
            >
              <Plus className="h-4 w-4" />
              Add Route
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <UserRoutingPageContent />
    </Fragment>
  );
}

