'use client';

import dynamic from 'next/dynamic';
import { CreditCard, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useState } from 'react';

const TrustedCardsPageContent = dynamic(
  () => import('./trusted-cards-content').then(mod => ({ default: mod.TrustedCardsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function TrustedCardsPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Trusted Cards"
            description="Manage trusted card whitelist entries to bypass fraud checks for verified and trusted payment cards"
            icon={CreditCard}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 me-2" />
              Add Card
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <TrustedCardsPageContent addDialogOpen={addDialogOpen} setAddDialogOpen={setAddDialogOpen} />
    </>
  );
}

