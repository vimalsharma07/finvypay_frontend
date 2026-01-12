'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Receipt, MoreHorizontal, Eye } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getUserSettlements,
  UserSettlement,
} from '@/lib/services/user/settlements';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import Link from 'next/link';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

const DATE_FMT = 'yyyy-MM-dd';
const DATE_TIME_FMT = 'yyyy-MM-dd HH:mm';

export default function UserSettlementsPage() {
  const [data, setData] = useState<UserSettlement[]>([]);
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

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '—';
    return num.toLocaleString();
  };

  const paidStatusVariant = (isPaid: boolean) => {
    return isPaid ? 'success' : 'warning';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;

      const response = await getUserSettlements({
        page,
        limit,
      });
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setData(res.data);
            setMeta(res.meta);
          } else {
            toast.error('Invalid response structure while loading settlements');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load settlements');
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred while fetching settlements');
      console.error('Settlements fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const columns = useMemo<ColumnDef<UserSettlement>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Invoice Number" />
        ),
        cell: ({ row }) => row.original.invoiceNumber || '—',
      },
      {
        accessorKey: 'settlementDate',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Settlement Date" />
        ),
        cell: ({ row }) =>
          row.original.settlementDate
            ? format(new Date(row.original.settlementDate), DATE_FMT)
            : '—',
      },
      {
        accessorKey: 'grossAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Gross Amount" />
        ),
        cell: ({ row }) => formatCurrency(row.original.grossAmountUsd),
      },
      {
        accessorKey: 'totalDeductionsUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Deductions" />
        ),
        cell: ({ row }) => formatCurrency(row.original.totalDeductionsUsd),
      },
      {
        accessorKey: 'netAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Net Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.netAmountUsd)}
          </span>
        ),
      },
      {
        accessorKey: 'paidAmount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Paid Amount" />
        ),
        cell: ({ row }) => formatCurrency(row.original.paidAmount),
      },
      {
        accessorKey: 'isPaid',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={paidStatusVariant(row.original.isPaid)}
            className="px-2.5 py-1 text-[11px] font-semibold leading-tight uppercase tracking-wide"
          >
            {row.original.isPaid ? 'Paid' : 'Pending'}
          </Badge>
        ),
      },
      {
        accessorKey: 'paidAt',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Paid At" />
        ),
        cell: ({ row }) =>
          row.original.paidAt
            ? format(new Date(row.original.paidAt), DATE_TIME_FMT)
            : '—',
      },
      {
        accessorKey: 'totalSuccessCount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Success Count" />
        ),
        cell: ({ row }) => formatNumber(row.original.totalSuccessCount),
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
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="px-2">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/settlement/${row.original.id}`} className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
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
            title="Settlements"
            description="View all your settlement records with payment status, amounts, and transaction details"
            icon={Receipt}
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

