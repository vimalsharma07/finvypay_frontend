'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { CreditCard, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';

const UserTrustedCardsPageContent = dynamic(
  () => import('./trusted-cards-content').then(mod => ({ default: mod.UserTrustedCardsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function TrustedCardsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Safe Cards"
            description="Whitelist verified cards that can skip extra fraud checks"
            icon={CreditCard}
          />
          <ToolbarActions>
            <Button
              variant="primary"
              className="rounded-xl shadow-sm shadow-sky-500/20"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Safe Card
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <UserTrustedCardsPageContent addDialogOpen={addDialogOpen} onAddDialogOpenChange={setAddDialogOpen} />
    </Fragment>
  );
}

