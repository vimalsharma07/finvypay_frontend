'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { FileText } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { CursorDataGridPagination } from '@/components/ui/cursor-data-grid-pagination';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardTable } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  modernTableLayout,
  modernTableClassNames,
  modernTableCardClasses,
} from '@/app/(protected)/components/table-comp';
import {
  getAffiliateSettlements,
  type AffiliateSettlementRow,
  type AffiliateSettlementListResponse,
} from '@/lib/services/affiliate/settlements';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

const DATE_FMT = 'yyyy-MM-dd';

const formatCurrency = (amount: string | null | undefined) => {
  if (amount == null || amount === '') return '—';
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined) return '—';
  return num.toLocaleString();
};

export default function AffiliateReportsSettlementPage() {
  const [data, setData] = useState<AffiliateSettlementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);

  const fetchData = useCallback(
    async (cursor: string | undefined, pageLimit: number) => {
      setLoading(true);
      try {
        const response = await getAffiliateSettlements({
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          sortBy,
          sortOrder,
        });
        handleApiResponse<AffiliateSettlementListResponse>(response, {
          onSuccess: (res) => {
            if (res?.success && Array.isArray(res.data)) {
              setData(res.data);
              setMeta(res.meta ?? null);
            } else {
              toast.error('Invalid response while loading settlements');
            }
          },
          onError: (msg) => toast.error(msg || 'Failed to load settlements'),
        });
      } catch {
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder],
  );

  useEffect(() => {
    fetchData(requestCursor, limit);
  }, [fetchData, requestCursor, limit]);

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

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

  const columns = useMemo<ColumnDef<AffiliateSettlementRow>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Invoice Number" />
        ),
        cell: ({ row }) => row.original.invoiceNumber || '—',
      },
      {
        accessorKey: 'userName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Merchant" />
        ),
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.userName || '—'}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.userEmail || ''}
            </div>
          </div>
        ),
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
          <DataGridColumnHeader column={column} title="Paid" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={row.original.isPaid ? 'success' : 'warning'}
            className="px-2.5 py-1 text-[11px] font-semibold"
          >
            {row.original.isPaid ? 'Yes' : 'No'}
          </Badge>
        ),
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="px-2.5 py-1 text-[11px] font-semibold">
            {row.original.type || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'totalSuccessCount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Success Count" />
        ),
        cell: ({ row }) => formatNumber(row.original.totalSuccessCount),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: handleSortingChange,
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      if (next.pageSize !== pagination.pageSize) {
        setLimit(next.pageSize);
        setPagination({ pageIndex: 0, pageSize: next.pageSize });
        resetCursor();
      } else {
        setPagination(next);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: 1,
    getRowId: (row) => String(row.id),
  });

  return (
    <div className="overflow-x-hidden">
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Settlement Report"
            description="Settlement records for merchants linked to your partner account"
            icon={FileText}
          />
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={data.length}
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
              <CursorDataGridPagination
                meta={meta}
                onNext={handleCursorNext}
                onPrev={handleCursorPrev}
                canGoPrev={canGoPrev}
                rowCount={data.length}
              />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>
    </div>
  );
}
