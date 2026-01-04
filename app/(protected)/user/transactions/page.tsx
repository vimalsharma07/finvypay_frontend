'use client';

import dynamic from 'next/dynamic';
import { CreditCard } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const TransactionsPageContent = dynamic(
  () => import('./transactions-content').then(mod => ({ default: mod.TransactionsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function TransactionsPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Transactions"
          description="View and monitor all your production payment transactions with detailed information, filtering, and transaction history"
          icon={CreditCard}
        />
      </Toolbar>
      <TransactionsPageContent />
    </Container>
  );
}

