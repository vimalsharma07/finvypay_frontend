'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Filter } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import {
  getSandboxTransactions,
  resendTransactionWebhook,
  Transaction,
  TransactionListResponse,
  TRANSACTION_STATUS_FILTER_OPTIONS,
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
import { CursorDataGridPagination } from '@/components/ui/cursor-data-grid-pagination';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
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
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
import { getTransactionColumns } from '../shared/columns';
import { TransactionLogsDialog } from '../shared/transaction-logs-dialog';
import { filterTransactions } from '../shared/utils';
import { TransactionDetailsDialog } from '../shared/transaction-details-dialog';
import { Filter as FilterComponent } from '@/components/common/Filter';
import {
  FieldTypes,
  FilterFields,
  FiltersSchema,
  Option,
} from '@/lib/types/common-types';
import { generateFilterQuery, mapAdminTransactionFiltersToApiParams } from '@/lib/helpers';
import { getAllMerchantsPaginated } from '@/lib/services/admin/users';
import { getUserConnectors } from '@/lib/services/admin/connectors';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { useCountries } from '@/lib/hooks/use-countries';

export default function SandboxTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<TransactionListResponse['meta'] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [transactionForLogs, setTransactionForLogs] = useState<Transaction | null>(null);
  const [resendingWebhookTransactionId, setResendingWebhookTransactionId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterFields>({});
  const [filterOpen, setFilterOpen] = useState(false);

  // Dropdown options
  const [userOptions, setUserOptions] = useState<Option[]>([]);
  const [connectorOptions, setConnectorOptions] = useState<Option[]>([]);
  const { currencies } = useCurrencies();
  const { countries } = useCountries();
  const currencyOptions = useMemo(
    () =>
      currencies.map((currency) => ({
        label: currency.code,
        value: currency.code,
      })),
    [currencies]
  );
  const countryOptions = useMemo(
    () =>
      countries.map((country) => ({
        label: country.countryName,
        value: country.isoTwo,
      })),
    [countries]
  );
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
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
    async (
      cursor: string | undefined,
      pageLimit: number,
      activeFilters: FilterFields = {},
    ) => {
      setLoading(true);
      try {
        const filterQuery = generateFilterQuery(activeFilters);
        const apiParams = mapAdminTransactionFiltersToApiParams(filterQuery);
        const params = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          ...apiParams,
        };

        const response = await getSandboxTransactions(params);
        handleApiResponse<TransactionListResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && Array.isArray(data.data)) {
              setTransactions(data.data);
              setMeta(data.meta ?? null);
            } else {
              toast.error('Failed to fetch sandbox transactions - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch sandbox transactions');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch sandbox transactions error:', error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchTransactions(requestCursor, limit, filters);
  }, [fetchTransactions, requestCursor, limit, filters]);

  // Fetch filter options
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [merchants, connectorsRes] = await Promise.all([
          getAllMerchantsPaginated(),
          getUserConnectors(),
        ]);

        if (Array.isArray(merchants)) {
          setUserOptions(
            merchants.map((user) => ({
              label: user.name || user.email || user.id,
              value: String(user.id),
            }))
          );
        }

        const connPayload = connectorsRes.data;
        if (connPayload?.success && Array.isArray(connPayload.data)) {
          setConnectorOptions(
            connPayload.data.map((c) => ({
              label: c.name,
              value: String(c.id),
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load filter options', error);
      }
    };

    loadOptions();
  }, []);

  // Client-side filtering
  const filteredData = useMemo(
    () => filterTransactions(transactions, searchQuery),
    [transactions, searchQuery]
  );

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  // Handlers for action menu
  const handleViewDetails = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  }, []);

  const handleResendWebhook = useCallback(async (transaction: Transaction) => {
    const tid = transaction.transactionId?.trim();
    if (!tid) {
      toast.error('Missing transaction ID');
      return;
    }
    setResendingWebhookTransactionId(tid);
    try {
      const response = await resendTransactionWebhook(tid, true);
      handleApiResponse(response, {
        onSuccess: (data) => {
          const msg =
            data &&
            typeof data === 'object' &&
            'message' in data &&
            data.message != null &&
            String(data.message).trim()
              ? String(data.message)
              : 'Sandbox webhook resent successfully';
          toast.success(msg);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to resend sandbox webhook');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Resend sandbox webhook error:', error);
    } finally {
      setResendingWebhookTransactionId(null);
    }
  }, []);

  const handleViewLogs = useCallback((transaction: Transaction) => {
    setTransactionForLogs(transaction);
    setLogsDialogOpen(true);
  }, []);

  const handleViewLogsFromDetails = useCallback(
    (transaction: Transaction) => {
      handleViewLogs(transaction);
      setDetailsDialogOpen(false);
    },
    [handleViewLogs]
  );

  const handleApplyFilters = useCallback(
    (appliedFilters: FilterFields) => {
      setFilters(appliedFilters);
      resetCursor();
    },
    [resetCursor],
  );

  const filterSchema: FiltersSchema[] = useMemo(
    () => [
      {
        field: 'user_id',
        label: 'Merchant',
        type: FieldTypes.multiSelect,
        options: userOptions,
        multiSelectSize: 'comfortable',
      },
      { field: 'transaction_id', label: 'Transaction ID', type: FieldTypes.input },
      { field: 'order_id', label: 'Order ID', type: FieldTypes.input },
      { field: 'email', label: 'Email', type: FieldTypes.input },
      { field: 'card_bin', label: 'Card Bin', type: FieldTypes.input },
      {
        field: 'connector',
        label: 'Connector',
        type: FieldTypes.searchSelect,
        options: connectorOptions,
      },
      {
        field: 'currency',
        label: 'Currency',
        type: FieldTypes.searchSelect,
        options: currencyOptions,
      },
      {
        field: 'status',
        label: 'Status',
        type: FieldTypes.multiSelect,
        options: TRANSACTION_STATUS_FILTER_OPTIONS.map((o) => ({
          label: o.label,
          value: String(o.value),
        })),
      },
      {
        field: 'country',
        label: 'Country',
        type: FieldTypes.searchSelect,
        options: countryOptions,
      },
      { field: 'transaction_date', label: 'Transaction Date', type: FieldTypes.date },
      { field: 'refund_date', label: 'Refund Date', type: FieldTypes.date },
      { field: 'chargeback_date', label: 'ChargeBack Date', type: FieldTypes.date },
      { field: 'message', label: 'Message', type: FieldTypes.input },
    ],
    [userOptions, connectorOptions, currencyOptions, countryOptions]
  );

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () =>
      getTransactionColumns(
        handleViewDetails,
        false, // Hide disabled actions (refund, chargeback, suspicious) for sandbox
        undefined,
        undefined,
        undefined,
        handleViewLogs,
        handleResendWebhook,
        resendingWebhookTransactionId
      ),
    [handleViewDetails, handleViewLogs, handleResendWebhook, resendingWebhookTransactionId]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false,
    pageCount: 1,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      if (newPagination.pageSize !== pagination.pageSize) {
        setLimit(newPagination.pageSize);
        setPagination({ pageIndex: 0, pageSize: newPagination.pageSize });
        resetCursor();
      } else {
        setPagination(newPagination);
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
              title="Sandbox Transactions"
              description="View and manage all sandbox test transactions for development, testing, and integration validation"
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
            title="Sandbox Transactions"
            description="View and manage all sandbox test transactions for development, testing, and integration validation"
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

      <Container>
        <DataGrid
          table={table}
          recordCount={filteredData.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardHeading>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search sandbox transactions..."
                />
              </CardHeading>
            </CardHeader>
            <CardTable className={modernTableCardClasses.table}>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter className={modernTableCardClasses.footer}>
              <CursorDataGridPagination
                meta={meta}
                onNext={handleCursorNext}
                onPrev={handleCursorPrev}
                canGoPrev={canGoPrev}
                rowCount={filteredData.length}
              />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <TransactionDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        transaction={selectedTransaction}
        onResendWebhook={handleResendWebhook}
        isResendingWebhook={
          !!selectedTransaction?.transactionId &&
          resendingWebhookTransactionId === selectedTransaction.transactionId
        }
        onViewLogs={handleViewLogsFromDetails}
      />

      <TransactionLogsDialog
        open={logsDialogOpen}
        onOpenChange={setLogsDialogOpen}
        transaction={transactionForLogs}
        paymentMode="sandbox"
      />

      <FilterComponent
        filtersSchema={filterSchema}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        open={filterOpen}
        setOpen={setFilterOpen}
        baseUrl="/admin/transactions/sandbox-transactions"
      />
    </Fragment>
  );
}

