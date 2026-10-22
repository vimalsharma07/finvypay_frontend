'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { Network, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';

const UserIpAllowlistPageContent = dynamic(
  () => import('./ip-allowlist-content').then(mod => ({ default: mod.UserIpAllowlistPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function UserIpAllowlistPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Trusted IPs"
            description="Allow only approved IPs to access your payment workspace"
            icon={Network}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              className="rounded-xl shadow-sm shadow-sky-500/20"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add IP
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <UserIpAllowlistPageContent addDialogOpen={addDialogOpen} onAddDialogOpenChange={setAddDialogOpen} />
    </Fragment>
  );
}

