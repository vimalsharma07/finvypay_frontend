'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { ShieldCheck, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';

const UserManageRiskPageContent = dynamic(
  () => import('./manage-risk-content').then(mod => ({ default: mod.UserManageRiskPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function ManageRiskPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Manage Risk"
            description="Configure and manage risk management rules, fraud detection settings, and transaction security thresholds"
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
      <UserManageRiskPageContent addDialogOpen={addDialogOpen} onAddDialogOpenChange={setAddDialogOpen} />
    </Fragment>
  );
}

