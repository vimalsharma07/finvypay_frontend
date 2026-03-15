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

const AffiliateTransactionsPageContent = dynamic(
  () =>
    import('./transactions-content').then((mod) => ({
      default: mod.AffiliateTransactionsPageContent,
    })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AffiliateTransactionsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="All Transactions"
            description="View transactions from your referred merchants with filtering and search"
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
      <AffiliateTransactionsPageContent
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
      />
    </Fragment>
  );
}
