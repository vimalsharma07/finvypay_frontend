'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getMerchantApplications,
  changeApplicationStatus,
  MerchantApplication,
  ApplicationKycStatus,
} from '@/lib/services/admin/applications';
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const DATE_FMT = 'yyyy-MM-dd HH:mm';

export default function AdminApplicationListPage() {
  const [data, setData] = useState<MerchantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const formatStatus = (status?: string) =>
    status ? status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';

  const statusVariant = (status?: string) => {
    if (!status) return 'outline';
    const normalized = status.toLowerCase();
    if (normalized.includes('approved')) return 'success';
    if (normalized.includes('pending')) return 'warning';
    if (normalized.includes('reject')) return 'destructive';
    return 'outline';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;

      const response = await getMerchantApplications({ page, limit });
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setData(res.data);
            setMeta(res.meta);
          } else {
            toast.error('Invalid response structure while loading applications');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load applications');
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred while fetching applications');
      console.error('Applications fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChangeStatus = useCallback(
    async (userId: string, kycStatus: ApplicationKycStatus) => {
      const numericId = Number(userId);
      if (!Number.isFinite(numericId)) {
        toast.error('Invalid user id');
        return;
      }
      setActioningId(userId);
      try {
        const response = await changeApplicationStatus({ userId: numericId, kycStatus });
        handleApiResponse(response, {
          onSuccess: (res) => {
            if (res?.success) {
              toast.success(`Application ${kycStatus}`);
              fetchData();
            } else {
              toast.error(res?.message || 'Failed to update status');
            }
          },
          onError: (message) => {
            toast.error(message || 'Failed to update status');
          },
          silent: true,
        });
      } catch (error) {
        console.error('Change status error:', error);
        toast.error('An unexpected error occurred while updating status');
      } finally {
        setActioningId(null);
      }
    },
    [fetchData],
  );

  const columns = useMemo<ColumnDef<MerchantApplication>[]>(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => row.original.name || '—',
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => row.original.email || '—',
    },
    {
      accessorKey: 'entityType',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Entity" />
      ),
      cell: ({ row }) => row.original.entityType || '—',
    },
    {
      accessorKey: 'kycStatus',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="KYC Status" />
      ),
      cell: ({ row }) => (
        <Badge
          variant={statusVariant(row.original.kycStatus) as any}
          className="px-2.5 py-1 text-[11px] font-semibold leading-tight whitespace-normal max-w-[160px] text-left break-words uppercase tracking-wide"
        >
          {formatStatus(row.original.kycStatus)}
        </Badge>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Created" />
      ),
      cell: ({ row }) =>
        row.original.createdAt
          ? format(new Date(row.original.createdAt), DATE_FMT)
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
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => toast.info(`View ${row.original.id}`)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={actioningId === row.original.id}
              onClick={() => handleChangeStatus(row.original.id, 'approved')}
            >
              <span className={cn('text-success', actioningId === row.original.id && 'opacity-70')}>
                {actioningId === row.original.id ? 'Approving...' : 'Approve'}
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={actioningId === row.original.id}
              onClick={() => handleChangeStatus(row.original.id, 'rejected')}
            >
              <span className={cn('text-destructive', actioningId === row.original.id && 'opacity-70')}>
                {actioningId === row.original.id ? 'Rejecting...' : 'Reject'}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [actioningId, handleChangeStatus, formatStatus, statusVariant]);

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
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Applications"
            description="All merchant applications"
          />
          <ToolbarActions>
            {/* reserved for filters or bulk actions */}
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <DataGrid table={table} recordCount={meta?.total ?? data.length} isLoading={loading}>
          <DataGridTable table={table} isLoading={loading} />
          <DataGridPagination />
        </DataGrid>
      </Container>
    </Fragment>
  );
}


