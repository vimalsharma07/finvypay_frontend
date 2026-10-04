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
            title="Live Activity"
            description="Monitor production payments, filter outcomes, and export your money-flow history"
            icon={CreditCard}
          />
          <ToolbarActions>
            <ExportTransactionsDialog onExport={handleExportTransactions} />
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl border-sky-200 hover:bg-sky-50 hover:border-sky-300 dark:border-sky-800 dark:hover:bg-sky-950/40"
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Smart Filter
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <TransactionsPageContent filterOpen={filterOpen} setFilterOpen={setFilterOpen} />
    </Fragment>
  );
}

