'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, Filter } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getSettlementSummaryList,
  SettlementSummaryItem,
} from '@/lib/services/admin/settlements';
import { getMerchants } from '@/lib/services/admin/users';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardTable } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  modernTableLayout,
  modernTableClassNames,
  modernTableCardClasses,
} from '@/app/(protected)/components/table-comp';
import {
  AdvancedFilter,
  FilterField,
} from '@/app/(protected)/components/advanced-filter';
import { Button } from '@/components/ui/button';

const DATE_FMT = 'yyyy-MM-dd';

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(String(amount)) : amount;
  if (isNaN(numAmount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

export default function AdminSettlementSummaryPage() {
  const [data, setData] = useState<SettlementSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [merchantOptions, setMerchantOptions] = useState<{ label: string; value: string }[]>([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const userId = filters.userId || undefined;

      const response = await getSettlementSummaryList({
        userId,
        page,
        limit,
      });
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && Array.isArray(res.data)) {
            setData(res.data);
            setMeta(res.meta ?? null);
          } else {
            toast.error('Invalid response structure while loading settlement summary');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load settlement summary');
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred while fetching settlement summary');
      console.error('Settlement summary fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filters.userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const loadMerchants = async () => {
      try {
        const res = await getMerchants({ page: 1, limit: 1000, role: 'merchant' });
        if (res.data?.data && Array.isArray(res.data.data)) {
          setMerchantOptions(
            res.data.data.map((user) => ({
              label: user.name || user.email || user.id,
              value: String(user.id),
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load merchants for filter', e);
      }
    };
    loadMerchants();
  }, []);

  const filterFields: FilterField[] = useMemo(
    () => [
      {
        key: 'userId',
        label: 'Merchant',
        type: 'select-search',
        placeholder: 'Select merchant...',
        options: merchantOptions,
      },
    ],
    [merchantOptions]
  );

  const handleApplyFilters = (appliedFilters: Record<string, string>) => {
    setFilters(appliedFilters);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const handleResetFilters = () => {
    setFilters({});
  };

  const payoutStatusVariant = (isCompleted: boolean) =>
    isCompleted ? 'success' : 'warning';

  const columns = useMemo<ColumnDef<SettlementSummaryItem>[]>(
    () => [
      {
        accessorKey: 'user',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => row.original.user?.name ?? '—',
      },
      {
        accessorKey: 'transaction_date',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Transaction Date" />
        ),
        cell: ({ row }) =>
          row.original.transaction_date
            ? format(new Date(row.original.transaction_date), DATE_FMT)
            : '—',
      },
      {
        accessorKey: 'opening_balance',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Opening Balance" />
        ),
        cell: ({ row }) => formatCurrency(row.original.opening_balance),
      },
      {
        accessorKey: 'net_amount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Net Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.net_amount)}
          </span>
        ),
      },
      {
        accessorKey: 'payout_amount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Payout Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.payout_amount)}
          </span>
        ),
      },
      {
        accessorKey: 'closing_balance',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Closing Balance" />
        ),
        cell: ({ row }) =>
          formatCurrency(row.original.closing_balance),
      },
      {
        accessorKey: 'is_payout_completed',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Payout Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={payoutStatusVariant(row.original.is_payout_completed)}
            className="px-2.5 py-1 text-[11px] font-semibold leading-tight uppercase tracking-wide"
          >
            {row.original.is_payout_completed ? 'Completed' : 'Pending'}
          </Badge>
        ),
      },
      {
        accessorKey: 'payout_date',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Payout Date" />
        ),
        cell: ({ row }) =>
          row.original.payout_date
            ? format(new Date(row.original.payout_date), DATE_FMT)
            : '—',
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: meta ? meta.totalPages : -1,
  });

  return (
    <div className="overflow-x-hidden">
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Settlement Summary"
            description="View settlement summary by merchant with transaction dates, balances, and payout status"
            icon={FileText}
          />
          <ToolbarActions>
            <AdvancedFilter
              fields={filterFields}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
              trigger={
                <Button variant="outline">
                  <Filter className="size-4 mr-1" />
                  Advanced Filter
                </Button>
              }
            />
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.total ?? data.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
          <Card className={modernTableCardClasses.card}>
            <CardTable className={modernTableCardClasses.table}>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter className={modernTableCardClasses.footer}>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>
    </div>
  );
}
