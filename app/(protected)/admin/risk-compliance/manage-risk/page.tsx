'use client';

import dynamic from 'next/dynamic';
import { ShieldCheck, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useState } from 'react';

const ManageRiskPageContent = dynamic(
  () => import('./manage-risk-content').then(mod => ({ default: mod.ManageRiskPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function ManageRiskPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Manage Risk"
            description="Configure and manage risk management rules, thresholds, and fraud detection settings for transaction security"
            icon={ShieldCheck}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Risk
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <ManageRiskPageContent addDialogOpen={addDialogOpen} setAddDialogOpen={setAddDialogOpen} />
    </>
  );
}

