'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getMerchantBalances,
  MerchantBalance,
} from '@/lib/services/admin/settlements';
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
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

const DATE_FMT = 'yyyy-MM-dd';
const DATE_TIME_FMT = 'yyyy-MM-dd HH:mm';

export default function AdminMerchantBalancesPage() {
  const [data, setData] = useState<MerchantBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return '—';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const payoutStatusVariant = (isCompleted: boolean) => {
    return isCompleted ? 'success' : 'warning';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;

      const response = await getMerchantBalances({
        page,
        limit,
      });
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setData(res.data);
            setMeta(res.meta);
          } else {
            toast.error('Invalid response structure while loading merchant balances');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load merchant balances');
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred while fetching merchant balances');
      console.error('Merchant balances fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo<ColumnDef<MerchantBalance>[]>(
    () => [
      {
        accessorKey: 'userName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.user?.name || '—'}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.user?.email || '—'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'transactionDate',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Transaction Date" />
        ),
        cell: ({ row }) =>
          row.original.transactionDate
            ? format(new Date(row.original.transactionDate), DATE_FMT)
            : '—',
      },
      {
        accessorKey: 'openingBalance',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Opening Balance" />
        ),
        cell: ({ row }) => formatCurrency(row.original.openingBalance),
      },
      {
        accessorKey: 'netAmount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Net Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.netAmount)}</span>
        ),
      },
      {
        accessorKey: 'payoutAmount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Payout Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">{formatCurrency(row.original.payoutAmount)}</span>
        ),
      },
      {
        accessorKey: 'settlementCharge',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Settlement Charge" />
        ),
        cell: ({ row }) => formatCurrency(row.original.settlementCharge),
      },
      {
        accessorKey: 'closingBalance',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Closing Balance" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">{formatCurrency(row.original.closingBalance)}</span>
        ),
      },
      {
        accessorKey: 'isPayoutCompleted',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Payout Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={payoutStatusVariant(row.original.isPayoutCompleted)}
            className="px-2.5 py-1 text-[11px] font-semibold leading-tight uppercase tracking-wide"
          >
            {row.original.isPayoutCompleted ? 'Completed' : 'Pending'}
          </Badge>
        ),
      },
      {
        accessorKey: 'payoutDate',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Payout Date" />
        ),
        cell: ({ row }) =>
          row.original.payoutDate
            ? format(new Date(row.original.payoutDate), DATE_FMT)
            : '—',
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) =>
          row.original.createdAt
            ? format(new Date(row.original.createdAt), DATE_TIME_FMT)
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
            title="Merchant Balances"
            description="View and manage merchant balance records with transaction dates, payout amounts, and balance information"
            icon={Wallet}
          />
          <ToolbarActions>
            {/* reserved for filters or bulk actions */}
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

