'use client';

import { Fragment, useEffect, useState } from 'react';
import { Users, Plus, Pencil, Eye, Trash2 } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getUsers,
  deleteUser,
  User,
  UserListResponse,
} from '@/lib/services/admin/users';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdvancedFilter, FilterField } from '../../../components/advanced-filter';
import { ConfirmComp } from '../../../components/confirm-comp';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AffiliateUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<UserListResponse['meta'] | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  
  // Filter state
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Fetch users function
  const fetchUsers = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC',
    filterParams?: Record<string, string>
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
        role: 'affiliate', // Default to affiliate role for affiliate users page
      };

      // Add filter parameters if provided
      if (filterParams) {
        if (filterParams.name) params.search = filterParams.name;
        if (filterParams.email) params.email = filterParams.email;
        // Override default role if filter role is provided
        if (filterParams.role) {
          params.role = filterParams.role;
        }
        if (filterParams.status) {
          params.isBlocked = filterParams.status === 'blocked';
        }
      }

      const response = await getUsers(params);

      // Handle response using centralized handler
      handleApiResponse<UserListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            // New format: { success: true, data: [...], meta: {...} }
            setUsers(data.data);
            setMeta(data.meta);
            console.log('Users list:', data.data);
            console.log('Meta info:', data.meta);
          } else {
            console.warn('⚠️ API returned success=false:', data);
          }
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
        },
        onUnauthorized: () => {
          console.log('Please check your TOKEN in .env file');
        },
      });
    } catch (error) {
      console.error('❌ Network/Request error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when pagination, sorting, limit, or filters change
  useEffect(() => {
    fetchUsers(page, limit, sortBy, sortOrder, filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder, filters]);

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
  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1); // Reset to first page when sorting changes
  };

  // Handle filter apply
  const handleApplyFilters = (appliedFilters: Record<string, string>) => {
    setFilters(appliedFilters);
    setPage(1); // Reset to first page when filters change
    // Filters will be applied via useEffect when filters state changes
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
    // Filters will be reset via useEffect when filters state changes
  };

  // Define filter fields (statically for now)
  const filterFields: FilterField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text-search',
      placeholder: 'Search by name',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'select-search',
      placeholder: 'Select email...',
      options: [
        { label: 'user1@example.com', value: 'user1@example.com' },
        { label: 'user2@example.com', value: 'user2@example.com' },
      ],
    },
  ];

  // Handle create user
  const handleCreateUser = () => {
    router.push('/admin/user-management/affiliate/create');
  };

  // Define table headers
  const headers: TableHeader<User>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    { key: 'isBlocked', label: 'Status', sortable: true },
    { key: 'createdAt', label: 'Created At', sortable: true },
  ];

  // Render cell function - handles all cell rendering dynamically
  const renderCell = (item: User, key: keyof User | string) => {
    switch (key) {
      case 'name':
        return <div className="font-medium">{item.name}</div>;
      case 'email':
        return <div className="text-muted-foreground">{item.email}</div>;
      case 'role':
        return (
          <Badge variant="secondary" className="capitalize">
            {item.role}
          </Badge>
        );
      case 'isBlocked':
        return (
          <Badge
            variant={item.isBlocked ? 'destructive' : 'success'}
            className="capitalize"
          >
            {item.isBlocked ? 'Blocked' : 'Active'}
          </Badge>
        );
      case 'createdAt':
        const date = new Date(item.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      default:
        const value = item[key as keyof User];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Delete user handler
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await deleteUser(userId);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Affiliate deleted successfully!');
          // Immediately refetch users list to update the table
          fetchUsers(page, limit, sortBy, sortOrder, filters);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete affiliate');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
        console.error('Delete affiliate error:', error);
    }
  };

  // Define actions
  const actions: TableAction<User>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      route: (row: User) => `/admin/user-management/affiliate/${row.id}/edit`,
    },
    {
      label: 'View',
      icon: Eye,
      route: (row: User) => `/admin/user-management/affiliate/${row.id}`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: User) => {
        setUserToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Affiliates"
              description="Create, edit, and manage affiliate accounts with commission structures, referral tracking, and performance analytics"
              icon={Users}
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
              title="Affiliates"
              description="Create, edit, and manage affiliate accounts with commission structures, referral tracking, and performance analytics"
              icon={Users}
            />
          <ToolbarActions>
            <AdvancedFilter
              fields={filterFields}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
            <Button variant="primary" onClick={handleCreateUser}>
              <Plus className="h-4 w-4 me-1" />
              Create Affiliate
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={users}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search affiliates..."
          searchKeys={['name', 'email', 'role']}
          getRowId={(row: User) => row.id}
          pagination={{
            pageSize: limit,
            pageIndex: page - 1, // Convert to 0-based for table
            totalCount: meta?.totalItems ?? 0,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
          sorting={{
            sortBy: sortBy,
            sortOrder: sortOrder,
            onSortChange: handleSortChange,
          }}
          loading={loading}
        />
      </Container>

      {/* Delete Confirmation Dialog */}
      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Affiliate"
        message={`Are you sure you want to delete affiliate "${userToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (userToDelete) {
            await handleDeleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onCancel={() => {
          setUserToDelete(null);
        }}
      />
    </Fragment>
  );
}
