'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  getPermissions,
  deletePermission,
  Permission,
  PermissionListResponse,
} from '@/lib/services/admin/permissions';
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
import { Button } from '@/components/ui/button';
import { Search, X, Pencil, Trash2 } from 'lucide-react';
import { TableActionMenu, TableActionMenuItem } from '@/app/(protected)/components/table-action-menu';
import { cn } from '@/lib/utils';
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

export function PermissionsPageContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await getPermissions();
      handleApiResponse<PermissionListResponse>(response, {
        onSuccess: (data) => {
          if (data && data.success && Array.isArray(data.data)) {
            setPermissions(data.data);
          } else {
            toast.error('Failed to fetch permissions - invalid response structure');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch permissions');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return permissions;
    const searchLower = searchQuery.toLowerCase();
    return permissions.filter(
      (permission) =>
        permission.name.toLowerCase().includes(searchLower) ||
        permission.module?.toLowerCase().includes(searchLower) ||
        permission.subModule?.toLowerCase().includes(searchLower) ||
        permission.type?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, permissions]);

  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;
    setDeleting(true);
    try {
      const response = await deletePermission(permissionToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Permission deleted successfully!');
          setDeleteDialogOpen(false);
          setPermissionToDelete(null);
          fetchPermissions();
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete permission');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete permission error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<Permission>[]>(
    () => [
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
        accessorKey: 'module',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Module" />
        ),
        cell: ({ row }) => {
          return <div>{row.original.module || '-'}</div>;
        },
      },
      {
        accessorKey: 'subModule',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="SubModule" />
        ),
        cell: ({ row }) => {
          return <div>{row.original.subModule || '-'}</div>;
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant="secondary" className="capitalize">
              {row.original.type}
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
          const actions: TableActionMenuItem<Permission>[] = [
            {
              label: 'Edit',
              icon: Pencil,
              route: (permission) => `/admin/roles-permissions/permissions/${permission.id}/edit`,
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: (permission) => {
                setPermissionToDelete(permission);
                setDeleteDialogOpen(true);
              },
              variant: 'destructive',
              separator: true,
            },
          ];
          return <TableActionMenu row={row.original} actions={actions} />;
        },
        enableSorting: false,
        size: 80,
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
    onPaginationChange: setPagination,
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      pagination,
    },
  });

  return (
    <Fragment>
      <Container>
        <DataGrid
          table={table}
          recordCount={filteredData.length}
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
          <Card className="rounded-md border-border/50 bg-card shadow-sm">
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
                    placeholder="Search permissions..."
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Permission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete permission &quot;{permissionToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              <X className="h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePermission}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}

