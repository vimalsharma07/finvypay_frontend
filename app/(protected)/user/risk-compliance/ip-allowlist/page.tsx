'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Network } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getUserIpWhitelist,
  deleteUserIpWhitelist,
  updateUserIpWhitelist,
  createUserIpWhitelist,
  IpWhitelist,
  IpWhitelistListResponse,
} from '@/lib/services/user/ip-whitelist';
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
import { Search, X, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function UserIpAllowlistPage() {
  const [ipWhitelist, setIpWhitelist] = useState<IpWhitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<IpWhitelistListResponse['data']['meta'] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ipToDelete, setIpToDelete] = useState<IpWhitelist | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ipToEdit, setIpToEdit] = useState<IpWhitelist | null>(null);
  const [updating, setUpdating] = useState(false);
  const [editIp, setEditIp] = useState('');
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

      const response = await getUserIpWhitelist(params);
      handleApiResponse<IpWhitelistListResponse>(response, {
        onSuccess: (data) => {
          // New format: { success: true, data: [...], meta: {...} }
          if (data && data.success && data.data) {
            setIpWhitelist(data.data);
            setMeta(data.meta);
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
        item.ip?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, ipWhitelist]);

  const handleAddIp = async (ips: string[]) => {
    setAdding(true);
    try {
      const response = await createUserIpWhitelist({ ip: ips });
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

  const handleUpdateIp = async () => {
    if (!ipToEdit || !editIp.trim()) {
      toast.error('Please enter a valid IP address');
      return;
    }

    setUpdating(true);
    try {
      const response = await updateUserIpWhitelist(ipToEdit.id, { ip: editIp.trim() });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('IP address updated successfully!');
          setEditDialogOpen(false);
          setIpToEdit(null);
          setEditIp('');
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

  const handleDeleteIp = async () => {
    if (!ipToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteUserIpWhitelist(ipToDelete.id);
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

  const handleOpenEditDialog = (ip: IpWhitelist) => {
    setIpToEdit(ip);
    setEditIp(ip.ip);
    setEditDialogOpen(true);
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
        accessorKey: 'ip',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="IP Address" />
        ),
        cell: ({ row }) => {
          return <div className="font-mono font-medium">{row.original.ip}</div>;
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original.status?.toLowerCase();
          let variant: 'success' | 'warning' | 'destructive' | 'info' = 'info';
          let appearance: 'default' | 'light' = 'light';
          
          if (status === 'approved') {
            variant = 'success';
            appearance = 'light';
          } else if (status === 'pending') {
            variant = 'warning';
            appearance = 'light';
          } else if (status === 'rejected') {
            variant = 'destructive';
            appearance = 'light';
          }
          
          return (
            <Badge variant={variant} appearance={appearance} className="capitalize">
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
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <Button
                className="size-7"
                mode="icon"
                variant="ghost"
                onClick={() => handleOpenEditDialog(row.original)}
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
                title="Delete IP"
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
              title="IP Allowlist"
              description="Add and manage IP address allowlist entries for secure access control and enhanced security"
              icon={Network}
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
            title="IP Allowlist"
            description="Add and manage IP address allowlist entries for secure access control and enhanced security"
            icon={Network}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              Add IP Address
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
            cellBorder: false,
            rowBorder: true,
            rowRounded: false,
            stripped: false,
            headerBackground: true,
            headerBorder: true,
            headerSticky: true,
            width: 'fixed',
          }}
          tableClassNames={{
            base: 'text-sm',
            header: 'bg-gradient-to-b from-muted/40 to-muted/20 border-b border-border',
            headerRow: 'h-14',
            headerSticky: 'sticky top-0 z-10 bg-background/98 backdrop-blur-md shadow-sm border-b border-border',
            body: '',
            bodyRow: 'h-14 hover:bg-primary/5 hover:border-l-2 hover:border-l-primary transition-all duration-200 cursor-pointer border-b border-border/30',
            edgeCell: '',
          }}
        >
          <Card className="rounded-2xl border-border/50 bg-card shadow-sm">
            <CardHeader className="border-b border-border/50 bg-muted/20">
              <CardHeading>
                <div className="relative w-full max-w-lg my-2 group">
                  <Search className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none size-4.5 transition-all duration-200",
                    searchQuery 
                      ? "text-primary" 
                      : "text-muted-foreground group-focus-within:text-primary"
                  )} />
                  <Input
                    placeholder="Search IP addresses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                      "pl-11 pr-10 h-9 text-sm w-full",
                      "bg-background border-border/60",
                      "focus-visible:border-primary/50 focus-visible:ring-primary/20",
                      "transition-all duration-200",
                      "shadow-sm hover:shadow-md focus-visible:shadow-lg",
                      searchQuery && "border-primary/30 bg-primary/5"
                    )}
                  />
                  {searchQuery.length > 0 && (
                    <Button
                      mode="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-muted/80 transition-colors"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}
                </div>
              </CardHeading>
            </CardHeader>
            <CardTable className="overflow-hidden">
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter className="border-t border-border/50 bg-muted/10">
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      {/* Edit IP Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit IP Address</DialogTitle>
            <DialogDescription>
              Update the IP address for this allowlist entry.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                placeholder="e.g., 192.168.1.1"
                value={editIp}
                onChange={(e) => setEditIp(e.target.value)}
                disabled={updating}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setIpToEdit(null);
                setEditIp('');
              }}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdateIp}
              disabled={updating || !editIp.trim()}
            >
              {updating ? 'Updating...' : 'Update IP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add IP Dialog */}
      <AddIpDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddIp}
        isSubmitting={adding}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete IP Allowlist Entry</AlertDialogTitle>
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

