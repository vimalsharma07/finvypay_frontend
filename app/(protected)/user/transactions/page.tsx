'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getProductionTransactions,
  Transaction,
  TransactionListResponse,
} from '@/lib/services/user/transaction';
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
import { SearchInput } from './shared/search-input';
import { getTransactionColumns } from './shared/columns';
import { filterTransactions } from './shared/utils';
import { TransactionDetailsDialog } from './shared/transaction-details-dialog';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<TransactionListResponse['data']['meta'] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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
        const params: {
          page: number;
          limit: number;
        } = {
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

  const handleViewDetails = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  }, []);

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => getTransactionColumns(handleViewDetails),
    [handleViewDetails]
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
              description="View all your transactions"
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
          <div className="flex items-center justify-between w-full">
            <ToolbarHeading
              title="Transactions"
              description="View all your transactions"
            />
          </div>
        </Toolbar>
      </Container>

      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalItems || filteredData.length}
          isLoading={loading}
          tableLayout={{
            cellBorder: false,
            rowBorder: true,
            rowRounded: false,
            stripped: false,
            headerBackground: true,
            headerBorder: true,
            headerSticky: true,
            width: 'fixed',
          }}
          tableClassNames={{
            base: 'text-sm',
            header: 'bg-gradient-to-b from-muted/40 to-muted/20 border-b border-border',
            headerRow: 'h-14',
            headerSticky: 'sticky top-0 z-10 bg-background/98 backdrop-blur-md shadow-sm border-b border-border',
            body: '',
            bodyRow: 'h-14 hover:bg-primary/5 hover:border-l-2 hover:border-l-primary transition-all duration-200 cursor-pointer border-b border-border/30',
            edgeCell: '',
          }}
        >
          <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardHeading>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search transactions..."
                />
              </CardHeading>
            </CardHeader>
            <CardTable className="overflow-hidden">
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter className="border-t border-border/50 bg-muted/10">
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
    </Fragment>
  );
}

