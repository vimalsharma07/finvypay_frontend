'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getGateways,
  deleteGateway,
  Gateway,
  GatewayListResponse,
} from '@/lib/services/admin/gateways';
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
import { Search, X, Pencil, Trash2 } from 'lucide-react';
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

export default function AdminGatewaysPage() {
  const router = useRouter();
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gatewayToDelete, setGatewayToDelete] = useState<Gateway | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [meta, setMeta] = useState<GatewayListResponse['data']['meta'] | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchGateways = async (pageNum: number, pageLimit: number) => {
    setLoading(true);
    try {
      const response = await getGateways({
        page: pageNum,
        limit: pageLimit,
      });
      handleApiResponse<GatewayListResponse>(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data) {
            setGateways(data.data.data);
            setMeta(data.data.meta);
          } else {
            toast.error('Failed to fetch gateways - invalid response structure');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch gateways');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery) return gateways;

    const searchLower = searchQuery.toLowerCase();
    return gateways.filter(
      (gateway) =>
        gateway.gatewayName.toLowerCase().includes(searchLower) ||
        gateway.fileName.toLowerCase().includes(searchLower) ||
        gateway.status.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, gateways]);

  const handleDeleteGateway = async () => {
    if (!gatewayToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteGateway(gatewayToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Gateway deleted successfully!');
          setDeleteDialogOpen(false);
          setGatewayToDelete(null);
          fetchGateways(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete gateway');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete gateway error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<Gateway>[]>(
    () => [
      {
        accessorKey: 'gatewayName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Gateway Name" />
        ),
        cell: ({ row }) => {
          return <div className="font-medium">{row.original.gatewayName}</div>;
        },
      },
      {
        accessorKey: 'fileName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="File Name" />
        ),
        cell: ({ row }) => {
          return <div className="text-muted-foreground">{row.original.fileName}</div>;
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
              <Link href={`/admin/gateways/gateways/${row.original.id}/edit`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              className="size-7"
              mode="icon"
              variant="ghost"
              onClick={() => {
                setGatewayToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
        enableSorting: false,
        size: 100,
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

  if (loading && gateways.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Gateways"
              description="Manage and view all payment gateways"
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
            title="Gateways"
            description="Manage and view all payment gateways"
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => router.push('/admin/gateways/gateways/create')}
            >
              Create Gateway
            </Button>
          </ToolbarActions>
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
                      placeholder="Search gateways..."
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
            <AlertDialogTitle>Delete Gateway</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete gateway &quot;{gatewayToDelete?.gatewayName}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGateway}
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

