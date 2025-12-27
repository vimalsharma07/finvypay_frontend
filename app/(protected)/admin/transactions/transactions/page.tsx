'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getProductionTransactions,
  processChargeback,
  processRefund,
  markSuspicious,
  Transaction,
  TransactionListResponse,
} from '@/lib/services/admin/transaction';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
} from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { SearchInput } from '../shared/search-input';
import { getTransactionColumns } from '../shared/columns';
import { filterTransactions } from '../shared/utils';
import { TransactionDetailsDialog } from '../shared/transaction-details-dialog';
import { ChargebackDialog } from '../shared/chargeback-dialog';
import { RefundDialog } from '../shared/refund-dialog';
import { SuspiciousDialog } from '../shared/suspicious-dialog';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<TransactionListResponse['data']['meta'] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [chargebackDialogOpen, setChargebackDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [suspiciousDialogOpen, setSuspiciousDialogOpen] = useState(false);
  const [transactionForAction, setTransactionForAction] = useState<Transaction | null>(null);
  const [processingChargeback, setProcessingChargeback] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  const [processingSuspicious, setProcessingSuspicious] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Pagination state for table
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const fetchTransactions = useCallback(
    async (pageNum: number, pageLimit: number) => {
      setLoading(true);
      try {
        const params = {
          page: pageNum,
          limit: pageLimit,
        };

        const response = await getProductionTransactions(params);
        handleApiResponse<TransactionListResponse>(response, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...], meta: {...} }
            if (data && data.success && data.data) {
              setTransactions(data.data);
              setMeta(data.meta);
            } else {
              toast.error('Failed to fetch transactions - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch transactions');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch transactions error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchTransactions(page, limit);
  }, [fetchTransactions, page, limit]);

  // Client-side filtering
  const filteredData = useMemo(
    () => filterTransactions(transactions, searchQuery),
    [transactions, searchQuery]
  );

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setPage(pageIndex + 1); // API uses 1-based, table uses 0-based
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page
  };

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      setPagination({
        pageIndex: meta.currentPage - 1, // Convert 1-based to 0-based
        pageSize: meta.itemsPerPage,
      });
    }
  }, [meta]);

  // Handlers for action menu
  const handleWebhookLogs = useCallback((transaction: Transaction) => {
    // TODO: Implement webhook logs view
    console.log('Webhook logs for transaction:', transaction.transactionId);
  }, []);

  const handleProviderLogs = useCallback((transaction: Transaction) => {
    // TODO: Implement provider logs view
    console.log('Provider logs for transaction:', transaction.transactionId);
  }, []);

  const handleTransactionLogs = useCallback((transaction: Transaction) => {
    // TODO: Implement transaction logs view
    console.log('Transaction logs for transaction:', transaction.transactionId);
  }, []);

  const handleViewDetails = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  }, []);

  const handleChargeback = useCallback((transaction: Transaction) => {
    setTransactionForAction(transaction);
    setChargebackDialogOpen(true);
  }, []);

  const handleRefund = useCallback((transaction: Transaction) => {
    setTransactionForAction(transaction);
    setRefundDialogOpen(true);
  }, []);

  const handleSuspicious = useCallback((transaction: Transaction) => {
    setTransactionForAction(transaction);
    setSuspiciousDialogOpen(true);
  }, []);

  const handleChargebackSubmit = useCallback(
    async (transactionId: string, remark: string) => {
      setProcessingChargeback(true);
      try {
        const response = await processChargeback(transactionId, { remark });
        handleApiResponse(response, {
          onSuccess: () => {
            toast.success('Chargeback processed successfully');
            setChargebackDialogOpen(false);
            setTransactionForAction(null);
            // Refresh transactions
            fetchTransactions(page, limit);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to process chargeback');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Chargeback error:', error);
      } finally {
        setProcessingChargeback(false);
      }
    },
    [page, limit, fetchTransactions]
  );

  const handleRefundSubmit = useCallback(
    async (transactionId: string, remark: string) => {
      setProcessingRefund(true);
      try {
        const response = await processRefund(transactionId, { remark });
        handleApiResponse(response, {
          onSuccess: () => {
            toast.success('Refund processed successfully');
            setRefundDialogOpen(false);
            setTransactionForAction(null);
            // Refresh transactions
            fetchTransactions(page, limit);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to process refund');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Refund error:', error);
      } finally {
        setProcessingRefund(false);
      }
    },
    [page, limit, fetchTransactions]
  );

  const handleSuspiciousSubmit = useCallback(
    async (transactionId: string, remark: string) => {
      setProcessingSuspicious(true);
      try {
        const response = await markSuspicious(transactionId, { remark });
        handleApiResponse(response, {
          onSuccess: () => {
            toast.success('Transaction marked as suspicious successfully');
            setSuspiciousDialogOpen(false);
            setTransactionForAction(null);
            // Refresh transactions
            fetchTransactions(page, limit);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to mark transaction as suspicious');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Suspicious error:', error);
      } finally {
        setProcessingSuspicious(false);
      }
    },
    [page, limit, fetchTransactions]
  );

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () =>
      getTransactionColumns(
        handleWebhookLogs,
        handleProviderLogs,
        handleTransactionLogs,
        handleViewDetails,
        true, // showDisabledActions = true for production
        handleChargeback,
        handleRefund,
        handleSuspicious
      ),
    [
      handleWebhookLogs,
      handleProviderLogs,
      handleTransactionLogs,
      handleViewDetails,
      handleChargeback,
      handleRefund,
      handleSuspicious,
    ]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false, // Client-side sorting
    pageCount: meta ? meta.totalPages : undefined,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      if (newPagination.pageIndex !== pagination.pageIndex) {
        handlePageChange(newPagination.pageIndex);
      }
      if (newPagination.pageSize !== pagination.pageSize) {
        handlePageSizeChange(newPagination.pageSize);
      }
    },
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      pagination,
    },
  });

  if (loading && transactions.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Transactions"
              description="View and manage all production transactions"
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-8">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Transactions"
            description="View and manage all production transactions"
          />
        </Toolbar>
      </Container>

      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalItems || filteredData.length}
          isLoading={loading}
          tableLayout={{
            cellBorder: true,
            width: 'fixed',
          }}
        >
          <Card>
            <CardHeader>
              <CardHeading>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search transactions..."
                />
              </CardHeading>
            </CardHeader>
            <CardTable>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <TransactionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        transaction={selectedTransaction}
      />

      <ChargebackDialog
        open={chargebackDialogOpen}
        onOpenChange={setChargebackDialogOpen}
        transaction={transactionForAction}
        onSubmit={handleChargebackSubmit}
        isSubmitting={processingChargeback}
      />

      <RefundDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        transaction={transactionForAction}
        onSubmit={handleRefundSubmit}
        isSubmitting={processingRefund}
      />

      <SuspiciousDialog
        open={suspiciousDialogOpen}
        onOpenChange={setSuspiciousDialogOpen}
        transaction={transactionForAction}
        onSubmit={handleSuspiciousSubmit}
        isSubmitting={processingSuspicious}
      />
    </Fragment>
  );
}

