'use client';

import dynamic from 'next/dynamic';
import { Network, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useState } from 'react';

const IpAllowlistPageContent = dynamic(
  () => import('./ip-allowlist-content').then(mod => ({ default: mod.IpAllowlistPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminIpWhitelistPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="IP Whitelist"
            description="Add, edit, and manage IP address whitelist entries for secure access control and fraud prevention"
            icon={Network}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              Add IP
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <IpAllowlistPageContent addDialogOpen={addDialogOpen} setAddDialogOpen={setAddDialogOpen} />
    </>
  );
}

