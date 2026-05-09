'use client';

import { Fragment, useCallback, useState } from 'react';
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
import { ExportTransactionsDialog } from '@/app/(protected)/admin/transactions/shared/export-transactions-dialog';
import { exportProductionTransactions } from '@/lib/services/user/transaction';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

const TransactionsPageContent = dynamic(
  () => import('./transactions-content').then(mod => ({ default: mod.TransactionsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function TransactionsPage() {
  const [filterOpen, setFilterOpen] = useState(false);

  const handleExportTransactions = useCallback(
    async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
      const response = await exportProductionTransactions({ startDate, endDate });
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data.url) {
            if (typeof window !== 'undefined') {
              window.open(data.url, '_blank', 'noopener,noreferrer');
            }
          } else {
            toast.error(data?.message || 'Export URL not available');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to export transactions');
        },
      });
    },
    []
  );

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
            <ExportTransactionsDialog onExport={handleExportTransactions} />
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

