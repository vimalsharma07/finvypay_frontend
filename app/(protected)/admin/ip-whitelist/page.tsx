'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getIpWhitelist,
  deleteIpWhitelist,
  updateIpWhitelistStatus,
  updateIpWhitelist,
  createIpWhitelist,
  IpWhitelist,
  IpWhitelistListResponse,
} from '@/lib/services/admin/ip-whitelist';
import { EditIpDialog } from './components/edit-ip-dialog';
import { AddIpDialog } from './components/add-ip-dialog';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Badge } from '@/components/ui/badge';
import {
  ColumnDef,
  getCoreRowModel,
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
import { Search, X, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
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
import { toast } from 'sonner';

export default function AdminIpWhitelistPage() {
  const [ipWhitelist, setIpWhitelist] = useState<IpWhitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<IpWhitelistListResponse['data']['meta'] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ipToDelete, setIpToDelete] = useState<IpWhitelist | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ipToEdit, setIpToEdit] = useState<IpWhitelist | null>(null);
  const [updating, setUpdating] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIpWhitelist = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC'
  ) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
      };

      const response = await getIpWhitelist(params);
      handleApiResponse<IpWhitelistListResponse>(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data) {
            setIpWhitelist(data.data.data);
            setMeta(data.data.meta);
          } else {
            toast.error('Failed to fetch IP whitelist - invalid response structure');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch IP whitelist');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIpWhitelist(page, limit, sortBy, sortOrder);
  }, [page, limit, sortBy, sortOrder]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery) return ipWhitelist;

    const searchLower = searchQuery.toLowerCase();
    return ipWhitelist.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.ip?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, ipWhitelist]);

  const handleApproveIp = async (id: string) => {
    setApprovingId(id);
    try {
      const response = await updateIpWhitelistStatus(id, { status: 'approved' });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('IP whitelist entry approved successfully!');
          fetchIpWhitelist(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to approve IP whitelist entry');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Approve IP whitelist error:', error);
    } finally {
      setApprovingId(null);
    }
  };

  const handleUpdateIp = async (id: string, ip: string) => {
    setUpdating(true);
    try {
      const response = await updateIpWhitelist(id, { ip });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('IP address updated successfully!');
          setEditDialogOpen(false);
          setIpToEdit(null);
          fetchIpWhitelist(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update IP address');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update IP whitelist error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddIp = async (userId: string, ips: string[]) => {
    setAdding(true);
    try {
      const response = await createIpWhitelist({
        user_id: userId,
        ips: ips,
      });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('IP addresses added successfully!');
          setAddDialogOpen(false);
          fetchIpWhitelist(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to add IP addresses');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Add IP whitelist error:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteIp = async () => {
    if (!ipToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteIpWhitelist(ipToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('IP whitelist entry deleted successfully!');
          setDeleteDialogOpen(false);
          setIpToDelete(null);
          fetchIpWhitelist(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete IP whitelist entry');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete IP whitelist error:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Table state
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true }, // Default sort
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Handle page change
  const handlePageChange = (pageIndex: number) => {
    setPage(pageIndex + 1); // API uses 1-based, table uses 0-based
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page
  };

  // Handle sort change
  const handleSortChange = (columnId: string, desc: boolean) => {
    setSortBy(columnId);
    setSortOrder(desc ? 'DESC' : 'ASC');
    setPage(1); // Reset to first page when sorting changes
  };

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      setPagination({
        pageIndex: meta.currentPage - 1, // Convert 1-based to 0-based
        pageSize: meta.itemsPerPage,
      });
    }
  }, [meta]);

  const columns = useMemo<ColumnDef<IpWhitelist>[]>(
    () => [
      {
        id: 'userName',
        accessorFn: (row) => row.user?.name || '',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="User Name" />
        ),
        cell: ({ row }) => {
          return <div className="font-medium">{row.original.user?.name || '-'}</div>;
        },
      },
      {
        accessorKey: 'ip',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="IP Address" />
        ),
        cell: ({ row }) => {
          return <div className="font-mono">{row.original.ip}</div>;
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status;
          const variant = status === 'approved' ? 'default' : status === 'pending' ? 'secondary' : 'destructive';
          return (
            <Badge variant={variant} className="capitalize">
              {status}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => {
          const isPending = row.original.status === 'pending';
          const isApproving = approvingId === row.original.id;
          
          return (
            <div className="flex items-center gap-2">
              {isPending && (
                <Button
                  className="size-7"
                  mode="icon"
                  variant="ghost"
                  onClick={() => handleApproveIp(row.original.id)}
                  disabled={isApproving}
                  title="Approve"
                >
                  <CheckCircle2 className={`size-4 text-green-600 ${isApproving ? 'opacity-50' : ''}`} />
                </Button>
              )}
              <Button
                className="size-7"
                mode="icon"
                variant="ghost"
                onClick={() => {
                  setIpToEdit(row.original);
                  setEditDialogOpen(true);
                }}
                title="Edit IP"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                className="size-7"
                mode="icon"
                variant="ghost"
                onClick={() => {
                  setIpToDelete(row.original);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          );
        },
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
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: meta ? meta.totalPages : undefined,
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
      if (newSorting.length > 0) {
        const sort = newSorting[0];
        handleSortChange(sort.id, sort.desc);
      }
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      // Only trigger API call if page or pageSize actually changed
      if (newPagination.pageIndex !== pagination.pageIndex) {
        handlePageChange(newPagination.pageIndex);
      }
      if (newPagination.pageSize !== pagination.pageSize) {
        handlePageSizeChange(newPagination.pageSize);
      }
    },
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      pagination,
    },
  });

  if (loading && ipWhitelist.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="IP Whitelist"
              description="Manage and view all IP whitelist entries"
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
            title="IP Whitelist"
            description="Manage and view all IP whitelist entries"
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              Add IP
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalItems || filteredData.length}
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
                      placeholder="Search IP whitelist..."
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

      <AddIpDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddIp}
        isSubmitting={adding}
      />

      <EditIpDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        ipWhitelist={ipToEdit}
        onSubmit={handleUpdateIp}
        isSubmitting={updating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IP Whitelist Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete IP &quot;{ipToDelete?.ip}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIp}
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

