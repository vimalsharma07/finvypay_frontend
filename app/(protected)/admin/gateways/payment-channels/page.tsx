'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getPaymentChannels,
  deletePaymentChannel,
  PaymentChannel,
  PaymentChannelListResponse,
} from '@/lib/services/admin/payment-channels';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Badge } from '@/components/ui/badge';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X, Pencil, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminPaymentChannelsPage() {
  const router = useRouter();
  const [paymentChannels, setPaymentChannels] = useState<PaymentChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [channelToDelete, setChannelToDelete] = useState<PaymentChannel | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [meta, setMeta] = useState<PaymentChannelListResponse['data']['meta'] | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchPaymentChannels = async (pageNum: number, pageLimit: number) => {
    setLoading(true);
    try {
      const response = await getPaymentChannels({
        page: pageNum,
        limit: pageLimit,
      });
      handleApiResponse<PaymentChannelListResponse>(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data) {
            setPaymentChannels(data.data.data);
            setMeta(data.data.meta);
          } else {
            toast.error('Failed to fetch payment channels - invalid response structure');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch payment channels');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentChannels(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return paymentChannels;

    const searchLower = searchQuery.toLowerCase();
    return paymentChannels.filter(
      (channel) =>
        channel.gateway?.gatewayName?.toLowerCase().includes(searchLower) ||
        channel.name?.toLowerCase().includes(searchLower) ||
        channel.currency?.toLowerCase().includes(searchLower) ||
        channel.providerType?.toLowerCase().includes(searchLower) ||
        channel.flowType?.toLowerCase().includes(searchLower) ||
        channel.status?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, paymentChannels]);

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;

    setDeleting(true);
    try {
      const response = await deletePaymentChannel(channelToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Payment channel deleted successfully!');
          setDeleteDialogOpen(false);
          setChannelToDelete(null);
          fetchPaymentChannels(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete payment channel');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete payment channel error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<PaymentChannel>[]>(
    () => [
      {
        accessorKey: 'gateway.gatewayName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Gateway Name" />
        ),
        cell: ({ row }) => {
          return (
            <div className="font-medium">
              {row.original.gateway?.gatewayName || '-'}
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          return <div className="font-medium">{row.original.name}</div>;
        },
      },
      {
        accessorKey: 'currency',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Currency" />
        ),
        cell: ({ row }) => {
          return <div className="text-muted-foreground">{row.original.currency}</div>;
        },
      },
      {
        accessorKey: 'providerType',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Provider Type" />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant="secondary" className="capitalize">
              {row.original.providerType}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'flowType',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Flow Type" />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant="outline" className="capitalize">
              {row.original.flowType}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status.toLowerCase();
          return (
            <Badge
              variant={
                status === 'active'
                  ? 'success'
                  : status === 'inactive'
                    ? 'secondary'
                    : 'destructive'
              }
              className="capitalize"
            >
              {row.original.status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              className="size-7"
              mode="icon"
              variant="ghost"
              asChild
            >
              <Link href={`/admin/gateways/payment-channels/${row.original.id}/edit`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              className="size-7"
              mode="icon"
              variant="ghost"
              asChild
            >
              <Link href={`/admin/gateways/payment-channels/${row.original.id}/rates`}>
                <Plus className="size-4 text-primary" />
              </Link>
            </Button>
            <Button
              className="size-7"
              mode="icon"
              variant="ghost"
              onClick={() => {
                setChannelToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
        enableSorting: false,
        size: 120,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      // Update server-side pagination
      if (newPagination.pageIndex !== page - 1) {
        setPage(newPagination.pageIndex + 1);
      }
      if (newPagination.pageSize !== limit) {
        setLimit(newPagination.pageSize);
        setPage(1);
      }
    },
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: meta ? meta.totalPages : 0,
  });

  if (loading && paymentChannels.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Payment Channels"
              description="Manage and view all payment channels"
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-8">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Payment Channels"
            description="Manage and view all payment channels"
          />
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalItems ?? filteredData.length}
          isLoading={loading}
          tableLayout={{
            cellBorder: true,
          }}
        >
          <Card>
            <CardHeader>
              <CardHeading>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search payment channels..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-9 w-40"
                    />
                    {searchQuery.length > 0 && (
                      <Button
                        mode="icon"
                        variant="ghost"
                        className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery('')}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeading>
            </CardHeader>
            <CardTable>
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete payment channel &quot;{channelToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}

