'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  getProductionTransactions,
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
import { SearchInput } from './shared/search-input';
import { getTransactionColumns } from './shared/columns';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
import { filterTransactions } from './shared/utils';
import { DynamicTransactionDetailsDialogUser } from '@/components/dialogs';
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

interface TransactionsPageContentProps {
  filterOpen?: boolean;
  setFilterOpen?: (open: boolean) => void;
}

export function TransactionsPageContent({ filterOpen: externalFilterOpen, setFilterOpen: externalSetFilterOpen }: TransactionsPageContentProps = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<TransactionListResponse['meta'] | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<FilterFields>({});
  const [internalFilterOpen, setInternalFilterOpen] = useState(false);
  
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

  // Use external filter state if provided, otherwise use internal
  const filterOpen = externalFilterOpen !== undefined ? externalFilterOpen : internalFilterOpen;
  const setFilterOpen = externalSetFilterOpen || setInternalFilterOpen;

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

        const response = await getProductionTransactions(params);
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

  return (
    <Fragment>
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
                  placeholder="Search transactions..."
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

      <DynamicTransactionDetailsDialogUser
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
        baseUrl="/transactions"
      />
    </Fragment>
  );
}

