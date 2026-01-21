'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { CreditCard, Filter } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';

const TransactionsPageContent = dynamic(
  () => import('./transactions-content').then(mod => ({ default: mod.TransactionsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function TransactionsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Transactions"
            description="View and monitor all your production payment transactions with detailed information, filtering, and transaction history"
            icon={CreditCard}
          />
          <ToolbarActions>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Advanced Filter
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <TransactionsPageContent filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
    </Fragment>
  );
}

