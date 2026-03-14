'use client';

import { useMemo, useState } from 'react';
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
  useReactTable,
  SortingState,
  PaginationState,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardFooter, CardTable } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  modernTableLayout,
  modernTableClassNames,
  modernTableCardClasses,
} from '@/app/(protected)/components/table-comp';

const DATE_FMT = 'yyyy-MM-dd';
const DATE_TIME_FMT = 'yyyy-MM-dd HH:mm';

/** Row type aligned with admin settlement list (same fields for table) */
interface AffiliateSettlementRow {
  id: string;
  invoiceNumber: string;
  userName: string;
  userEmail: string;
  settlementDate: string;
  grossAmountUsd: string | null;
  totalDeductionsUsd: string | null;
  netAmountUsd: string | null;
  paidAmount: string | null;
  isPaid: boolean;
  type: string;
  totalSuccessCount: number | null;
  createdAt: string;
}

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
  const [data] = useState<AffiliateSettlementRow[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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
          <DataGridColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.userName || '—'}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.userEmail || '—'}
            </span>
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
          <DataGridColumnHeader column={column} title="Success" />
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
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: 1,
  });

  return (
    <div className="overflow-x-hidden">
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Settlement Report"
            description="View settlement records for your referred merchants"
            icon={FileText}
          />
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={0}
          isLoading={false}
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
