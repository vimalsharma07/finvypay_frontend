'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getAgreements,
  AgreementListResponse,
  Agreement,
  deleteAgreement,
} from '@/lib/services/admin/agreements';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  TableComp,
  TableHeader,
  TableAction,
} from '../../../components/table-comp';
import { Badge } from '@/components/ui/badge';
import { ConfirmComp } from '../../../components/confirm-comp';
import { toast } from 'sonner';

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<AgreementListResponse['data']['meta'] | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null);

  // Edit dialog state (for future implementation)
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [agreementToEdit, setAgreementToEdit] = useState<Agreement | null>(null);

  // Fetch agreements function
  const fetchAgreements = async (
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

      const response = await getAgreements(params);

      // Handle response using centralized handler
      handleApiResponse<AgreementListResponse>(response, {
        onSuccess: (data) => {
          if (data.success) {
            // New format: { success: true, data: [...], meta: {...} }
            setAgreements(data.data);
            setMeta(data.meta);
          } else {
            console.warn('⚠️ API returned success=false:', data);
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch agreements');
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
    fetchAgreements(page, limit, sortBy, sortOrder);
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

  // Handle edit
  const handleEditAgreement = (agreement: Agreement) => {
    setAgreementToEdit(agreement);
    setEditDialogOpen(true);
  };

  // Delete agreement handler
  const handleDeleteAgreement = async (agreementId: string) => {
    try {
      const response = await deleteAgreement(agreementId);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Agreement deleted successfully!');
          // Immediately refetch agreements list to update the table
          fetchAgreements(page, limit, sortBy, sortOrder);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete agreement');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete agreement error:', error);
    }
  };

  // Define table headers
  const headers: TableHeader<Agreement>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
  ];

  // Render cell function - handles all cell rendering dynamically
  const renderCell = (item: Agreement, key: keyof Agreement | string) => {
    switch (key) {
      case 'name':
        return (
          <div className="font-medium">
            {item.name}
          </div>
        );
      case 'type':
        return (
          <Badge variant="secondary" className="capitalize">
            {item.type}
          </Badge>
        );
      default:
        const value = item[key as keyof Agreement];
        return (
          <div className="text-foreground font-normal">
            {value != null ? String(value) : '-'}
          </div>
        );
    }
  };

  // Define actions
  const actions: TableAction<Agreement>[] = [
    {
      label: 'Edit',
      onClick: (row: Agreement) => {
        handleEditAgreement(row);
      },
    },
    {
      label: 'Delete',
      onClick: (row: Agreement) => {
        setAgreementToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  if (loading && agreements.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Agreements"
              description="Manage and view all agreements"
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
            title="Agreements"
            description="Manage and view all agreements"
          />
          <ToolbarActions>
            {/* Create button can be added here in future */}
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <TableComp
          data={agreements}
          headers={headers}
          renderCell={renderCell}
          actions={actions}
          enableCheckbox={false}
          searchPlaceholder="Search agreements..."
          searchKeys={['name', 'type']}
          getRowId={(row: Agreement) => row.id}
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
        title="Delete Agreement"
        message={`Are you sure you want to delete agreement "${agreementToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Yes, Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (agreementToDelete) {
            await handleDeleteAgreement(agreementToDelete.id);
            setAgreementToDelete(null);
          }
        }}
        onCancel={() => {
          setAgreementToDelete(null);
        }}
      />
    </Fragment>
  );
}

