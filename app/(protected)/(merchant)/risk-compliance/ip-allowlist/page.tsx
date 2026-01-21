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
            title="IP Allowlist"
            description="Add and manage IP address allowlist entries for secure access control and enhanced security"
            icon={Network}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add IP Address
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <UserIpAllowlistPageContent addDialogOpen={addDialogOpen} onAddDialogOpenChange={setAddDialogOpen} />
    </Fragment>
  );
}

