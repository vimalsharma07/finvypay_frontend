'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, Plus, X, Trash2 } from 'lucide-react';
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
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
import { DynamicAddCardDialogAdmin, DynamicEditCardDialog } from '@/components/dialogs';

interface TrustedCardsPageContentProps {
  addDialogOpen?: boolean;
  setAddDialogOpen?: (open: boolean) => void;
}

export function TrustedCardsPageContent({ addDialogOpen: externalAddDialogOpen, setAddDialogOpen: externalSetAddDialogOpen }: TrustedCardsPageContentProps = {}) {
  const [cardWhitelist, setCardWhitelist] = useState<CardWhitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<CardWhitelist | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [internalAddDialogOpen, setInternalAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  
  // Use external dialog state if provided, otherwise use internal
  const addDialogOpen = externalAddDialogOpen !== undefined ? externalAddDialogOpen : internalAddDialogOpen;
  const setAddDialogOpen = externalSetAddDialogOpen || setInternalAddDialogOpen;
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cardToEdit, setCardToEdit] = useState<CardWhitelist | null>(null);
  const [updating, setUpdating] = useState(false);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const fetchCardWhitelist = useCallback(
    async (cursor: string | undefined, pageLimit: number) => {
      setLoading(true);
      try {
        const params = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
        };
        const response = await getCardWhitelist(params);
        handleApiResponse<CardWhitelistListResponse>(response, {
          onSuccess: (data) => {
            if (data?.success && Array.isArray(data.data)) {
              setCardWhitelist(data.data);
              setMeta(data.meta ?? null);
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
    fetchCardWhitelist(requestCursor, limit);
  }, [fetchCardWhitelist, requestCursor, limit]);

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
          fetchCardWhitelist(requestCursor, limit);
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
          fetchCardWhitelist(requestCursor, limit);
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
          fetchCardWhitelist(requestCursor, limit);
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

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const formatCardNumber = useMemo(
    () => (card: string | null | undefined) => {
      if (!card) return '-';
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
    manualSorting: false,
    pageCount: 1,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      if (newPagination.pageSize !== pagination.pageSize) {
        setLimit(newPagination.pageSize);
        setPagination({ pageIndex: 0, pageSize: newPagination.pageSize });
        resetCursor();
      } else {
        setPagination(newPagination);
      }
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
          recordCount={filteredData.length}
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
              <CursorDataGridPagination
                meta={meta}
                onNext={handleCursorNext}
                onPrev={handleCursorPrev}
                canGoPrev={canGoPrev}
                rowCount={filteredData.length}
              />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <DynamicAddCardDialogAdmin
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddCard}
        isSubmitting={adding}
      />

      <DynamicEditCardDialog
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
            <AlertDialogCancel disabled={deleting}>
              <X className="h-4 w-4" />
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
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

