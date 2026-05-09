'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
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
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { CursorDataGridPagination } from '@/components/ui/cursor-data-grid-pagination';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
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
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
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

const SORTABLE_IDS = new Set(['name', 'module', 'subModule', 'type', 'id', 'createdAt']);

export function PermissionsPageContent() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    resetCursor();
  }, [debouncedSearch, resetCursor]);

  useEffect(() => {
    setPagination((p) => ({ ...p, pageSize: limit, pageIndex: 0 }));
  }, [limit]);

  const sorting: SortingState = useMemo(
    () => [{ id: sortBy, desc: sortOrder === 'DESC' }],
    [sortBy, sortOrder],
  );

  const fetchPermissions = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      search: string,
      sBy: string,
      sOrder: 'ASC' | 'DESC',
    ) => {
      setLoading(true);
      try {
        const response = await getPermissions({
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          ...(search ? { search } : {}),
          sortBy: sBy,
          sortOrder: sOrder,
        });
        handleApiResponse<PermissionListResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && Array.isArray(data.data)) {
              setPermissions(data.data);
              setMeta(data.meta ?? null);
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
    },
    [],
  );

  useEffect(() => {
    fetchPermissions(requestCursor, limit, debouncedSearch, sortBy, sortOrder);
  }, [requestCursor, limit, debouncedSearch, sortBy, sortOrder, fetchPermissions]);

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    resetCursor();
  };

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

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
          fetchPermissions(requestCursor, limit, debouncedSearch, sortBy, sortOrder);
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
        enableSorting: true,
      },
      {
        accessorKey: 'module',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Module" />
        ),
        cell: ({ row }) => {
          return <div>{row.original.module || '-'}</div>;
        },
        enableSorting: true,
      },
      {
        accessorKey: 'subModule',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="SubModule" />
        ),
        cell: ({ row }) => {
          return <div>{row.original.subModule || '-'}</div>;
        },
        enableSorting: true,
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
        enableSorting: true,
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
    data: permissions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: 1,
    onSortingChange: (updater) => {
      const prev = sorting;
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!next.length) return;
      const s = next[0];
      if (!SORTABLE_IDS.has(s.id)) return;
      setSortBy(s.id);
      setSortOrder(s.desc ? 'DESC' : 'ASC');
      resetCursor();
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      if (newPagination.pageSize !== pagination.pageSize) {
        handlePageSizeChange(newPagination.pageSize);
      }
      setPagination(newPagination);
    },
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
          recordCount={meta?.totalCount ?? permissions.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardHeading>
                <div className="relative w-full max-w-lg my-2 group">
                  <Search className={cn(
                    "absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none size-4.5 transition-all duration-200",
                    searchInput
                      ? "text-primary"
                      : "text-muted-foreground group-focus-within:text-primary"
                  )} />
                  <Input
                    placeholder="Search permissions..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={cn(
                      "pl-11 pr-10 h-9 text-sm w-full",
                      "bg-background border-border/60",
                      "focus-visible:border-primary/50 focus-visible:ring-primary/20",
                      "transition-all duration-200",
                      "shadow-sm hover:shadow-md focus-visible:shadow-lg",
                      searchInput && "border-primary/30 bg-primary/5"
                    )}
                  />
                  {searchInput.length > 0 && (
                    <Button
                      mode="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-muted/80 transition-colors"
                      onClick={() => setSearchInput('')}
                    >
                      <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                  )}
                </div>
              </CardHeading>
            </CardHeader>
            <CardTable className={modernTableCardClasses.table}>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter
              className={cn(
                modernTableCardClasses.footer,
                'w-full min-w-0 flex-wrap items-stretch gap-2 py-3 sm:min-h-14',
              )}
            >
              <CursorDataGridPagination
                meta={meta}
                onNext={handleCursorNext}
                onPrev={handleCursorPrev}
                canGoPrev={canGoPrev}
                rowCount={permissions.length}
              />
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
