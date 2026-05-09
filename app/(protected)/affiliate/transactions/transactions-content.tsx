'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  getAffiliateRpMerchantTransactions,
  type AffiliateTransaction,
  type AffiliateTransactionListResponse,
} from '@/lib/services/affiliate/transactions';
import {
  getAffiliateMerchants,
  type AffiliateMerchant,
} from '@/lib/services/affiliate/merchants';
import { TRANSACTION_STATUS_FILTER_OPTIONS } from '@/lib/services/admin/transaction';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { generateFilterQuery, mapAffiliateTransactionFiltersToApiParams } from '@/lib/helpers';
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
import { SearchInput } from '@/app/(protected)/(merchant)/transactions/shared/search-input';
import { getAffiliateTransactionColumns } from './shared/columns';
import {
  modernTableLayout,
  modernTableClassNames,
  modernTableCardClasses,
} from '@/app/(protected)/components/table-comp';
import { Filter as FilterComponent } from '@/components/common/Filter';
import {
  FieldTypes,
  FilterFields,
  FiltersSchema,
} from '@/lib/types/common-types';
interface TransactionsPageContentProps {
  filterOpen?: boolean;
  setFilterOpen?: (open: boolean) => void;
}

export function AffiliateTransactionsPageContent({
  filterOpen: externalFilterOpen,
  setFilterOpen: externalSetFilterOpen,
}: TransactionsPageContentProps = {}) {
  const [transactions, setTransactions] = useState<AffiliateTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<AffiliateTransactionListResponse['meta'] | null>(null);
  const [filters, setFilters] = useState<FilterFields>({});
  const [internalFilterOpen, setInternalFilterOpen] = useState(false);

  const filterOpen = externalFilterOpen ?? internalFilterOpen;
  const setFilterOpen = externalSetFilterOpen ?? setInternalFilterOpen;

  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('transactionDate');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [searchQuery, setSearchQuery] = useState('');
  const [merchantOptions, setMerchantOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const acc: AffiliateMerchant[] = [];
      let cursor: string | undefined;
      const pageSize = 100;
      for (let i = 0; i < 50; i++) {
        const res = await getAffiliateMerchants({
          ...(cursor ? { cursor } : {}),
          limit: pageSize,
          sortBy: 'name',
          sortOrder: 'ASC',
        });
        if (cancelled) return;
        if (!res.data?.success || !Array.isArray(res.data.data)) break;
        acc.push(...res.data.data);
        const next = res.data.meta?.nextCursor;
        if (!next) break;
        cursor = next;
      }
      if (!cancelled) {
        setMerchantOptions(
          acc.map((m) => ({
            label: m.name || m.email || `Merchant ${m.id}`,
            value: String(m.id),
          }))
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchTransactions = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      activeFilters: FilterFields = {},
    ) => {
      setLoading(true);
      try {
        const filterQuery = generateFilterQuery(activeFilters);
        const apiParams = mapAffiliateTransactionFiltersToApiParams(filterQuery);
        const params = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          sortBy,
          sortOrder,
          ...apiParams,
        };

        const response = await getAffiliateRpMerchantTransactions(params);
        handleApiResponse<AffiliateTransactionListResponse>(response, {
          onSuccess: (data) => {
            if (data?.success && Array.isArray(data.data)) {
              setTransactions(data.data);
              setMeta(data.meta ?? null);
            } else {
              toast.error('Invalid response from server');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch transactions');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch affiliate transactions error:', error);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder],
  );

  useEffect(() => {
    fetchTransactions(requestCursor, limit, filters);
  }, [fetchTransactions, requestCursor, limit, filters]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const q = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.transactionId?.toLowerCase().includes(q) ||
        t.orderId?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.user?.email?.toLowerCase().includes(q) ||
        t.user?.name?.toLowerCase().includes(q)
    );
  }, [transactions, searchQuery]);

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const handleApplyFilters = useCallback((appliedFilters: FilterFields) => {
    setFilters(appliedFilters);
    resetCursor();
  }, [resetCursor]);

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'transactionDate', desc: true },
  ]);

  const handleSortingChange = useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      setSorting((prev) => {
        const next =
          typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue;
        if (next.length > 0) {
          const { id, desc } = next[0];
          setSortBy(id);
          setSortOrder(desc ? 'DESC' : 'ASC');
          resetCursor();
        }
        return next;
      });
    },
    [resetCursor],
  );

  const filterSchema: FiltersSchema[] = useMemo(
    () => [
      { field: 'transaction_id', label: 'Transaction ID', type: FieldTypes.input },
      {
        field: 'created_at',
        label: 'Start and end date',
        type: FieldTypes.dateRangeFilter,
      },
      {
        field: 'merchant_id',
        label: 'Merchants',
        type: FieldTypes.searchSelect,
        options: merchantOptions,
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
    ],
    [merchantOptions]
  );

  const columns = useMemo<ColumnDef<AffiliateTransaction>[]>(
    () => getAffiliateTransactionColumns(),
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: 1,
    onSortingChange: handleSortingChange,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
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
                  placeholder=""
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

      <FilterComponent
        filtersSchema={filterSchema}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        open={filterOpen}
        setOpen={setFilterOpen}
        baseUrl="/affiliate/transactions"
      />
    </Fragment>
  );
}
