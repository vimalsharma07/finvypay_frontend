'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getCardWhitelist,
  deleteCardWhitelist,
  createCardWhitelist,
  updateCardWhitelist,
  CardWhitelist,
  CardWhitelistListResponse,
} from '@/lib/services/admin/card-whitelist';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
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
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
import { Button } from '@/components/ui/button';
import { TableActionButtons } from './components/table-action-buttons';
import { SearchInput } from './components/search-input';
import { AddCardDialog } from './components/add-card-dialog';
import { EditCardDialog } from './components/edit-card-dialog';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

export default function TrustedCardsPage() {
  const [cardWhitelist, setCardWhitelist] = useState<CardWhitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CardWhitelistListResponse['data']['meta'] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardWhitelist | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<CardWhitelist | null>(null);
  const [updating, setUpdating] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Note: API doesn't support server-side sorting, so we'll use client-side sorting only

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCardWhitelist = useCallback(
    async (pageNum: number, pageLimit: number) => {
      setLoading(true);
      try {
        // API only accepts page and limit parameters
        const params = {
          page: pageNum,
          limit: pageLimit,
        };

        const response = await getCardWhitelist(params);
        handleApiResponse<CardWhitelistListResponse>(response, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...], meta: {...} }
            if (data && data.success && data.data) {
              setCardWhitelist(Array.isArray(data.data) ? data.data : []);
              setMeta(data.meta);
            } else {
              toast.error('Failed to fetch card whitelist - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch card whitelist');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchCardWhitelist(page, limit);
  }, [page, limit, fetchCardWhitelist]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery) return cardWhitelist;

    const searchLower = searchQuery.toLowerCase();
    return cardWhitelist.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.card?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, cardWhitelist]);

  const handleAddCard = async (userId: string, card: string) => {
    setAdding(true);
    try {
      const response = await createCardWhitelist({
        userId: Number(userId),
        card: card,
      });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Card whitelist entry created successfully!');
          setAddDialogOpen(false);
          fetchCardWhitelist(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create card whitelist entry');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create card whitelist error:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateCard = async (id: string, card: string) => {
    setUpdating(true);
    try {
      const response = await updateCardWhitelist(id, { card });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Card whitelist entry updated successfully!');
          setEditDialogOpen(false);
          setCardToEdit(null);
          fetchCardWhitelist(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update card whitelist entry');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update card whitelist error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!cardToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteCardWhitelist(cardToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Card whitelist entry deleted successfully!');
          setDeleteDialogOpen(false);
          setCardToDelete(null);
          fetchCardWhitelist(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete card whitelist entry');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete card whitelist error:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
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

  // Client-side sorting is handled by the table component

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      setPagination({
        pageIndex: meta.currentPage - 1, // Convert 1-based to 0-based
        pageSize: meta.itemsPerPage,
      });
    }
  }, [meta]);

  // Format card number to show only last 4 digits (memoized for performance)
  const formatCardNumber = useMemo(
    () => (card: string | null | undefined) => {
      if (!card) return '-';
      // If card number is longer than 4 digits, show only last 4 with mask
      if (card.length > 4) {
        return `****${card.slice(-4)}`;
      }
      return card;
    },
    []
  );

  const columns = useMemo<ColumnDef<CardWhitelist>[]>(
    () => [
      {
        id: 'card',
        accessorKey: 'card',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Card Number" />
        ),
        cell: ({ row }) => {
          return (
            <div className="font-mono">
              {formatCardNumber(row.original.card)}
            </div>
          );
        },
      },
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
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => (
          <TableActionButtons
            row={row.original}
            onEdit={(card) => {
              setCardToEdit(card);
              setEditDialogOpen(true);
            }}
            onDelete={(card) => {
              setCardToDelete(card);
              setDeleteDialogOpen(true);
            }}
          />
        ),
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
    manualSorting: false, // Client-side sorting since API doesn't support it
    pageCount: meta ? meta.totalPages : undefined,
    onSortingChange: setSorting,
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

  if (loading && cardWhitelist.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Trusted Cards"
              description="Manage and view all trusted card whitelist entries"
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
            title="Trusted Cards"
            description="Manage and view all trusted card whitelist entries"
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              Add Card
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalItems || filteredData.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardHeading>
                <SearchInput
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search cards..."
                />
              </CardHeading>
            </CardHeader>
            <CardTable className={modernTableCardClasses.table}>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter className={modernTableCardClasses.footer}>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <AddCardDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddCard}
        isSubmitting={adding}
      />

      <EditCardDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        cardWhitelist={cardToEdit}
        onSubmit={handleUpdateCard}
        isSubmitting={updating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card Whitelist Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete card &quot;{cardToDelete?.card ? formatCardNumber(cardToDelete.card) : 'N/A'}&quot; for user &quot;{cardToDelete?.user?.name || 'N/A'}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
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

