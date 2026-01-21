'use client';

import dynamic from 'next/dynamic';
import { Building, Plus } from 'lucide-react';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense, useState } from 'react';

const IndustriesContent = dynamic(
  () => import('./industries-content').then(mod => ({ default: mod.IndustriesPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function IndustriesPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Industries"
            description="Create, edit, and manage industry categories for merchant classification and organization"
            icon={Building}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Industry
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <IndustriesContent createDialogOpen={createDialogOpen} setCreateDialogOpen={setCreateDialogOpen} />
    </Suspense>
  );
}
