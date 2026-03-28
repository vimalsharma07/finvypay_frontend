'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  getRoles,
  deleteRole,
  Role,
  RoleListResponse,
} from '@/lib/services/admin/roles';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Badge } from '@/components/ui/badge';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { CursorDataGridPagination } from '@/components/ui/cursor-data-grid-pagination';
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
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import { DEFAULT_LIST_PAGE_SIZE } from '@/lib/types/pagination';
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

export function RolesPageContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [meta, setMeta] = useState<RoleListResponse['meta']>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_LIST_PAGE_SIZE,
  });
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRoles = useCallback(async (
    cursor: string | undefined,
    pageLimit: number,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ) => {
    setLoading(true);
    try {
      const response = await getRoles({
        ...(cursor ? { cursor } : {}),
        limit: pageLimit,
        sortBy,
        sortOrder,
      });
      handleApiResponse<RoleListResponse>(response, {
        onSuccess: (data) => {
          if (data && data.success && Array.isArray(data.data)) {
            setRoles(data.data);
            setMeta(data.meta ?? null);
          } else {
            toast.error('Failed to fetch roles - invalid response structure');
            setMeta(null);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch roles');
          setMeta(null);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sortBy = sorting[0]?.id || 'createdAt';
    const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
    fetchRoles(requestCursor, pagination.pageSize, sortBy, sortOrder);
  }, [fetchRoles, pagination.pageSize, requestCursor, sorting]);

  const filteredData = useMemo(() => {
    if (!searchQuery) return roles;
    const searchLower = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(searchLower) ||
        role.type.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, roles]);

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      const response = await deleteRole(roleToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Role deleted successfully!');
          setDeleteDialogOpen(false);
          setRoleToDelete(null);
          const sortBy = sorting[0]?.id || 'createdAt';
          const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';
          fetchRoles(requestCursor, pagination.pageSize, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete role');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete role error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnDef<Role>[]>(
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
          const actions: TableActionMenuItem<Role>[] = [
            {
              label: 'Edit',
              icon: Pencil,
              route: (role) => `/admin/roles-permissions/roles/${role.id}/edit`,
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: (role) => {
                setRoleToDelete(role);
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
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: 1,
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(next);
      resetCursor();
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      if (next.pageSize !== pagination.pageSize) {
        setPagination({ pageIndex: 0, pageSize: next.pageSize });
        resetCursor();
      } else {
        setPagination(next);
      }
    },
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      pagination,
    },
  });

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [goNext, meta?.nextCursor]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  return (
    <Fragment>
      <Container>
        <DataGrid
          table={table}
          recordCount={filteredData.length}
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
                    searchQuery 
                      ? "text-primary" 
                      : "text-muted-foreground group-focus-within:text-primary"
                  )} />
                  <Input
                    placeholder="Search roles..."
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
                meta={meta ?? null}
                onNext={handleCursorNext}
                onPrev={handleCursorPrev}
                canGoPrev={canGoPrev}
                rowCount={filteredData.length}
                className="w-full min-w-0"
              />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete role &quot;{roleToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              <X className="h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
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

