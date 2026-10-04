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
  Transaction,
  TransactionListResponse,
} from '@/lib/services/user/transaction';
import { TRANSACTION_STATUS_FILTER_OPTIONS } from '@/lib/services/admin/transaction';
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
import { filterTransactions } from '../shared/utils';
import { TransactionDetailsDialog } from '../shared/transaction-details-dialog';
import { Filter as FilterComponent } from '@/components/common/Filter';
import {
  FieldTypes,
  FilterFields,
  FiltersSchema,
  Option,
} from '@/lib/types/common-types';
import { generateFilterQuery, mapMerchantTransactionFiltersToApiParams } from '@/lib/helpers';
import { getAllUserAcquirerAccountsForFilter } from '@/lib/services/user/acquirer-accounts';
import { useCurrencies } from '@/lib/hooks/use-currencies';
import { useCountries } from '@/lib/hooks/use-countries';

export default function SandboxTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<TransactionListResponse['meta'] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterFields>({});
  const [filterOpen, setFilterOpen] = useState(false);

  // Dropdown options
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
        const apiParams = mapMerchantTransactionFiltersToApiParams(filterQuery);
        const params = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          ...apiParams,
        };

        const response = await getSandboxTransactions(params);
        handleApiResponse<TransactionListResponse>(response, {
          onSuccess: (data) => {
            const list = data?.data;
            const metaInfo = data?.meta;
            if (data?.success && list != null && Array.isArray(list)) {
              setTransactions(list);
              setMeta(metaInfo ?? null);
            } else {
              toast.error('Failed to fetch transactions - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            const msg = errorMessage || '';
            const isPrimaryMerchantMissing =
              msg.includes('PRIMARY_MERCHANT_PROFILE_NOT_FOUND') ||
              msg.includes('No primary merchant profile found for this user');

            if (isPrimaryMerchantMissing) {
              // Suppress toast for missing primary merchant profile
              return;
            }

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
    fetchTransactions(requestCursor, limit, filters);
  }, [fetchTransactions, requestCursor, limit, filters]);

  // Fetch connector filter options
  useEffect(() => {
    const loadConnectorOptions = async () => {
      try {
        const accounts = await getAllUserAcquirerAccountsForFilter();
        setConnectorOptions(
          accounts.map((c) => ({
            label: c.name,
            value: String(c.id),
          })),
        );
      } catch (error) {
        console.error('Failed to load connector options', error);
      }
    };

    loadConnectorOptions();
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

  const handleViewDetails = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  }, []);

  const handleApplyFilters = useCallback(
    (appliedFilters: FilterFields) => {
      setFilters(appliedFilters);
      resetCursor();
    },
    [resetCursor],
  );

  const filterSchema: FiltersSchema[] = useMemo(
    () => [
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
      { field: 'message', label: 'Message', type: FieldTypes.input },
    ],
    [connectorOptions, currencyOptions, countryOptions]
  );

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
              title="Test Activity"
              description="Sandbox payments for integration checks and flow validation"
              icon={CreditCard}
            />
            <ToolbarActions>
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
        <Container>
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 py-10 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            Loading test activity...
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Test Activity"
            description="Sandbox payments for integration checks and flow validation"
            icon={CreditCard}
          />
          <ToolbarActions>
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

      <Container>
        <div className="relative mb-4 overflow-hidden rounded-2xl border border-amber-200/70 bg-[linear-gradient(135deg,#fffbeb_0%,#ffffff_50%,#fef3c7_100%)] p-4 sm:p-5 dark:border-amber-900/40 dark:bg-[linear-gradient(135deg,#1c1917_0%,#0f172a_55%,#451a03_100%)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700/80 dark:text-amber-300/80">
                Sandbox money flow
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Safe test payments — no live settlement impact.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white/80 px-3 py-2 text-sm font-medium text-amber-700 shadow-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Test mode
            </div>
          </div>
        </div>

        <DataGrid
          table={table}
          recordCount={filteredData.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={{
            ...modernTableClassNames,
            header: 'bg-gradient-to-b from-amber-50/80 to-amber-50/30 border-b border-amber-100 dark:from-amber-950/30 dark:to-amber-950/10 dark:border-amber-900/40',
            headerSticky: 'sticky top-0 z-10 bg-background/98 backdrop-blur-md shadow-sm border-b border-amber-100 dark:border-amber-900/40',
            bodyRow: 'h-14 hover:bg-amber-500/5 hover:border-l-2 hover:border-l-amber-500 transition-all duration-200 cursor-pointer border-b border-border/30',
          }}
        >
          <Card className="rounded-2xl border-amber-100 bg-card shadow-sm ring-1 ring-amber-500/5 dark:border-amber-900/40">
            <CardHeader className="border-b border-amber-100/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20">
              <CardHeading>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search test activity..."
                />
              </CardHeading>
            </CardHeader>
            <CardTable className={modernTableCardClasses.table}>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter className="border-t border-amber-100/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/10">
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
      />

      <FilterComponent
        filtersSchema={filterSchema}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        open={filterOpen}
        setOpen={setFilterOpen}
        baseUrl="/transactions/sandbox-transactions"
      />
    </Fragment>
  );
}

