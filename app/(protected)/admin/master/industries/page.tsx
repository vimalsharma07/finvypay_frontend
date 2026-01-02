'use client';

import { Fragment, useEffect, useState } from 'react';
import { Building, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getIndustries,
  IndustryListResponse,
  Industry,
  deleteIndustry,
  updateIndustry,
  createIndustry,
} from '@/lib/services/admin/industries';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmComp } from '../../../components/confirm-comp';
import { toast } from 'sonner';
import { EditIndustryDialog } from './components/edit-industry-dialog';
import { CreateIndustryDialog } from './components/create-industry-dialog';

export default function IndustriesPage() {
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<IndustryListResponse['data']['meta'] | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Create dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [industryToEdit, setIndustryToEdit] = useState<Industry | null>(null);
  const [updating, setUpdating] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [industryToDelete, setIndustryToDelete] = useState<Industry | null>(null);

  // Fetch industries function
  const fetchIndustries = async (
    pageNum: number,
    pageLimit: number,
    sortField: string,
    sortDir: 'ASC' | 'DESC'
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page: pageNum,
        limit: pageLimit,
        sortBy: sortField,
        sortOrder: sortDir,
      };

      const response = await getIndustries(params);

      // Handle response using centralized handler
      handleApiResponse<IndustryListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            // New format: { success: true, data: [...], meta: {...} }
            setIndustries(data.data);
            setMeta(data.meta);
          } else {
            console.warn('⚠️ API returned success=false:', data);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch industries');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('❌ Network/Request error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when pagination, sorting, or limit change
  useEffect(() => {
    fetchIndustries(page, limit, sortBy, sortOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, sortBy, sortOrder]);

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

  // Handle create industry
  const handleCreateIndustry = async (name: string, status: string) => {
    setCreating(true);
    try {
      const response = await createIndustry({ name, status });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Industry created successfully!');
          setCreateDialogOpen(false);
          // Immediately refetch industries list to update the table
          fetchIndustries(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create industry');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create industry error:', error);
    } finally {
      setCreating(false);
    }
  };

  // Handle edit industry
  const handleEditIndustry = (industry: Industry) => {
    setIndustryToEdit(industry);
    setEditDialogOpen(true);
  };

  // Handle update industry
  const handleUpdateIndustry = async (name: string, status: string) => {
    if (!industryToEdit) return;

    setUpdating(true);
    try {
      const response = await updateIndustry(industryToEdit.id, { name, status });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Industry updated successfully!');
          setEditDialogOpen(false);
          setIndustryToEdit(null);
          // Immediately refetch industries list to update the table
          fetchIndustries(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update industry');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update industry error:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Delete industry handler
  const handleDeleteIndustry = async (industryId: string) => {
    try {
      const response = await deleteIndustry(industryId);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Industry deleted successfully!');
          // Immediately refetch industries list to update the table
          fetchIndustries(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete industry');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete industry error:', error);
    }
  };

  // Define table headers
  const headers: TableHeader<Industry>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  // Render cell function - handles all cell rendering dynamically
  const renderCell = (item: Industry, key: keyof Industry | string) => {
    switch (key) {
      case 'name':
        return (
          <div className="font-medium">
            {item.name}
          </div>
        );
      case 'status':
        return (
          <Badge
            variant={item.status === 'active' ? 'success' : 'destructive'}
            className="capitalize"
          >
            {item.status}
          </Badge>
        );
      default:
        const value = item[key as keyof Industry];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Define actions
  const actions: TableAction<Industry>[] = [
    {
      label: 'Edit',
      onClick: (row: Industry) => {
        handleEditIndustry(row);
      },
    },
    {
      label: 'Delete',
      onClick: (row: Industry) => {
        setIndustryToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  if (loading && industries.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Industries"
              description="Create, edit, and manage industry categories for merchant classification and organization"
              icon={Building}
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
            title="Industries"
            description="Create, edit, and manage industry categories for merchant classification and organization"
            icon={Building}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Industry
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TableComp
          data={industries}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search industries..."
          searchKeys={['name']}
          getRowId={(row: Industry) => row.id}
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

      {/* Create Dialog */}
      <CreateIndustryDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateIndustry}
        isSubmitting={creating}
      />

      {/* Edit Dialog */}
      <EditIndustryDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        industry={industryToEdit}
        onSubmit={handleUpdateIndustry}
        isSubmitting={updating}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmComp
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Industry"
        message={`Are you sure you want to delete industry "${industryToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (industryToDelete) {
            await handleDeleteIndustry(industryToDelete.id);
            setIndustryToDelete(null);
          }
        }}
        onCancel={() => {
          setIndustryToDelete(null);
        }}
      />
    </Fragment>
  );
}

