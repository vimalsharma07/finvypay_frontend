'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { ShieldUser } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
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
import { Button } from '@/components/ui/button';
import { TableActionMenu, TableActionMenuItem } from '@/app/(protected)/components/table-action-menu';
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
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminRolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch roles function
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getRoles();
      console.log('🔍 Full API Response:', response);

      // Handle response using centralized handler
      handleApiResponse<RoleListResponse>(response, {
        onSuccess: (data) => {
          console.log('✅ onSuccess called with data:', data);
          console.log('📊 Data structure check:', {
            hasData: !!data,
            hasSuccess: data?.success,
            hasDataArray: !!data?.data,
            dataType: Array.isArray(data?.data) ? 'array' : typeof data?.data,
            dataLength: Array.isArray(data?.data) ? data.data.length : 'not array',
          });
          
          if (data && data.success && Array.isArray(data.data)) {
            console.log('📋 Setting roles:', data.data);
            setRoles(data.data);
            console.log('✅ Roles state updated, count:', data.data.length);
            toast.success(`Loaded ${data.data.length} role(s)`);
          } else {
            console.warn('⚠️ API returned success=false or invalid structure:', data);
            toast.error('Failed to fetch roles - invalid response structure');
          }
        },
        onError: (errorMessage) => {
          console.error('❌ onError called:', errorMessage);
          toast.error(errorMessage || 'Failed to fetch roles');
        },
        onValidationError: (errors, messages) => {
          console.error('❌ Validation errors:', errors);
          toast.error('Validation error occurred');
        },
        onUnauthorized: () => {
          console.error('❌ Unauthorized');
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      console.error('❌ Network/Request error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
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
          fetchRoles();
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

  // Define columns
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

  // Initialize table
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

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Roles"
              description="Create, edit, and manage user roles with assigned permissions for access control and security management"
              icon={ShieldUser}
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
              title="Roles"
              description="Create, edit, and manage user roles with assigned permissions for access control and security management"
              icon={ShieldUser}
            />
          <ToolbarActions>
            <Button variant="primary" onClick={() => router.push('/admin/roles-permissions/roles/create')}>
              Create Role
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
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
            <AlertDialogTitle>Delete Role</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete role &quot;{roleToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
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

