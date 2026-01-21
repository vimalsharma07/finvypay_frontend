'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { LifeBuoy, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';

const SupportPageContent = dynamic(
  () => import('./support-content').then(mod => ({ default: mod.SupportPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function SupportPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Support"
            description="Create, view, and manage your support tickets with status tracking and communication history"
            icon={LifeBuoy}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Support Ticket
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <SupportPageContent
        createDialogOpen={createDialogOpen}
        setCreateDialogOpen={setCreateDialogOpen}
      />
    </Fragment>
  );
}

