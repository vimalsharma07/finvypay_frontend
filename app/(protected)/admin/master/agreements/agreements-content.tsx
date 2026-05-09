'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
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
} from '@/app/(protected)/components/table-comp';
import { Badge } from '@/components/ui/badge';
import { ConfirmComp } from '@/app/(protected)/components/confirm-comp';
import { toast } from 'sonner';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import type { CursorPaginationMeta } from '@/lib/types/pagination';

export function AgreementsPageContent() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null);

  const fetchAgreements = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      sortField: string,
      sortDir: 'ASC' | 'DESC',
    ) => {
      setLoading(true);
      try {
        const params = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
          sortBy: sortField,
          sortOrder: sortDir,
        };

        const response = await getAgreements(params);

        handleApiResponse<AgreementListResponse>(response, {
          onSuccess: (data) => {
            if (data.success && Array.isArray(data.data)) {
              setAgreements(data.data);
              setMeta(data.meta ?? null);
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
    },
    [],
  );

  useEffect(() => {
    fetchAgreements(requestCursor, limit, sortBy, sortOrder);
  }, [fetchAgreements, requestCursor, limit, sortBy, sortOrder]);

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    resetCursor();
  };

  const handleSortChange = (newSortBy: string, newSortOrder: 'ASC' | 'DESC') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    resetCursor();
  };

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  // Delete agreement handler
  const handleDeleteAgreement = async (agreementId: string) => {
    try {
      const response = await deleteAgreement(agreementId);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Agreement deleted successfully!');
          // Immediately refetch agreements list to update the table
          fetchAgreements(requestCursor, limit, sortBy, sortOrder);
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
      icon: Pencil,
      route: (row) => `/admin/master/agreements/${row.id}/edit`,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row: Agreement) => {
        setAgreementToDelete(row);
        setDeleteDialogOpen(true);
      },
      variant: 'destructive',
      separator: true,
    },
  ];

  return (
    <Fragment>
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
            onPageSizeChange: handlePageSizeChange,
          }}
          cursorPagination={{
            meta,
            onNext: handleCursorNext,
            onPrev: handleCursorPrev,
            canGoPrev,
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

