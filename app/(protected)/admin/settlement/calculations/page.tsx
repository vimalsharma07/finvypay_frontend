'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Calculator } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getSettlementCalculations,
  SettlementCalculation,
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

export default function AdminSettlementCalculationsPage() {
  const [data, setData] = useState<SettlementCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

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

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '—';
    return num.toLocaleString();
  };

  const formatPercentage = (rate: string | null | undefined) => {
    if (!rate) return '—';
    const numRate = parseFloat(rate);
    if (isNaN(numRate)) return rate;
    return `${numRate}%`;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const hasDateFilter = dateRange?.from && dateRange?.to;
      const startDate = hasDateFilter ? formatDateForAPI(dateRange.from) : undefined;
      const endDate = hasDateFilter ? formatDateForAPI(dateRange.to) : undefined;

      const response = await getSettlementCalculations({
        page,
        limit,
        startDate,
        endDate,
      });
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setData(res.data);
            setMeta(res.meta);
          } else {
            toast.error('Invalid response structure while loading settlement calculations');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load settlement calculations');
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred while fetching settlement calculations');
      console.error('Settlement calculations fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo<ColumnDef<SettlementCalculation>[]>(
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
        accessorKey: 'acquirer.acquirerName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Acquirer" />
        ),
        cell: ({ row }) => row.original.acquirer?.acquirerName || '—',
      },
      {
        accessorKey: 'merchantAcquirerAccount.name',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Account" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.merchantAcquirerAccount?.name || '—'}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.merchantAcquirerAccount?.terminalId || '—'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'transactionDate',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Date" />
        ),
        cell: ({ row }) =>
          row.original.transactionDate
            ? format(new Date(row.original.transactionDate), DATE_FMT)
            : '—',
      },
      {
        accessorKey: 'currency',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Currency" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline">{row.original.currency || '—'}</Badge>
        ),
      },
      {
        accessorKey: 'totalSuccessCount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Success Count" />
        ),
        cell: ({ row }) => formatNumber(row.original.totalSuccessCount),
      },
      {
        accessorKey: 'totalSuccessAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Success Amount" />
        ),
        cell: ({ row }) => formatCurrency(row.original.totalSuccessAmountUsd),
      },
      {
        accessorKey: 'mdrAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="MDR Amount" />
        ),
        cell: ({ row }) => formatCurrency(row.original.mdrAmountUsd),
      },
      {
        accessorKey: 'rollingReserveAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Rolling Reserve" />
        ),
        cell: ({ row }) => formatCurrency(row.original.rollingReserveAmountUsd),
      },
      {
        accessorKey: 'successTransactionFeeAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Transaction Fee" />
        ),
        cell: ({ row }) => formatCurrency(row.original.successTransactionFeeAmountUsd),
      },
      {
        accessorKey: 'netAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Net Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">{formatCurrency(row.original.netAmountUsd)}</span>
        ),
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

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

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
            title="Settlement Calculations"
            description="View detailed settlement calculation records with transaction counts, fees, and net amounts"
            icon={Calculator}
          />
          <ToolbarActions>
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Select from and to date"
              numberOfMonths={2}
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

