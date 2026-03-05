'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Container } from '@/components/common/container';
import {
  getSupportTickets,
  deleteSupportTicket,
  updateSupportTicket,
  createSupportTicket,
  SupportTicket,
  SupportTicketListResponse,
} from '@/lib/services/user/support-ticket';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
import { TicketActionMenu } from './components/ticket-action-menu';
import { SearchInput } from './components/search-input';
import { DynamicCreateTicketDialog, DynamicEditTicketDialog } from '@/components/dialogs';

interface SupportPageContentProps {
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
}

export function SupportPageContent({
  createDialogOpen,
  setCreateDialogOpen,
}: SupportPageContentProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<SupportTicketListResponse['data']['meta'] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<SupportTicket | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<SupportTicket | null>(null);
  const [updating, setUpdating] = useState(false);
  const [creating, setCreating] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Pagination state for table
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const fetchSupportTickets = useCallback(
    async (pageNum: number, pageLimit: number) => {
      setLoading(true);
      try {
        const params = {
          page: pageNum,
          limit: pageLimit,
        };

        const response = await getSupportTickets(params);
        handleApiResponse<SupportTicketListResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setTickets(Array.isArray(data.data.items) ? data.data.items : []);
              setMeta(data.data.meta ?? null);
            } else {
              toast.error('Failed to fetch support tickets - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch support tickets');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch support tickets error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchSupportTickets(page, limit);
  }, [page, limit, fetchSupportTickets]);

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      setPagination({
        pageIndex: meta.currentPage - 1,
        pageSize: meta.itemsPerPage,
      });
    }
  }, [meta]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery) return tickets;

    const searchLower = searchQuery.toLowerCase();
    return tickets.filter(
      (item) =>
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.priority?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, tickets]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1);
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setTicketToEdit(ticket);
    setEditDialogOpen(true);
  };

  const handleCreateTicket = async (formData: FormData) => {
    setCreating(true);
    try {
      const response = await createSupportTicket(formData);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Support ticket created successfully!');
          setCreateDialogOpen(false);
          fetchSupportTickets(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create support ticket');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create ticket error:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateTicket = async (
    id: string,
    title: string,
    description: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  ) => {
    setUpdating(true);
    try {
      const response = await updateSupportTicket(id, {
        title,
        description,
        priority,
      });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Ticket updated successfully!');
          setEditDialogOpen(false);
          setTicketToEdit(null);
          fetchSupportTickets(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update ticket');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update ticket error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteSupportTicket(ticketToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Ticket deleted successfully!');
          setDeleteDialogOpen(false);
          setTicketToDelete(null);
          fetchSupportTickets(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete ticket');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete ticket error:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityBadgeVariant = (priority: string): 'primary' | 'destructive' | 'secondary' | 'warning' | 'info' => {
    switch (priority) {
      case 'HIGH':
        return 'destructive';
      case 'CRITICAL':
        return 'destructive';
      case 'MEDIUM':
        return 'primary';
      case 'LOW':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const getStatusBadgeVariant = (status: string): 'primary' | 'destructive' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'OPEN':
        return 'primary';
      case 'IN_PROGRESS':
        return 'info';
      case 'RESOLVED':
        return 'success';
      case 'CLOSED':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  const columns = useMemo<ColumnDef<SupportTicket>[]>(
    () => [
      {
        id: 'ticketId',
        accessorKey: 'id',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Ticket ID" />
        ),
        cell: ({ row }) => {
          return <div className="font-mono text-xs text-muted-foreground">#{row.original.id}</div>;
        },
        size: 90,
        minSize: 80,
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
          return <div className="font-medium max-w-[300px] truncate">{row.original.title || '-'}</div>;
        },
        size: 250,
        minSize: 200,
      },
      {
        id: 'description',
        accessorKey: 'description',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Description" />
        ),
        cell: ({ row }) => {
          return (
            <div className="max-w-[400px] truncate text-muted-foreground">
              {row.original.description || '-'}
            </div>
          );
        },
        size: 400,
        minSize: 300,
      },
      {
        id: 'priority',
        accessorKey: 'priority',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Priority" />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant={getPriorityBadgeVariant(row.original.priority)}>
              {row.original.priority}
            </Badge>
          );
        },
        size: 120,
        minSize: 100,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant={getStatusBadgeVariant(row.original.status)}>
              {row.original.status.replace('_', ' ')}
            </Badge>
          );
        },
        size: 120,
        minSize: 100,
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => (
          <TicketActionMenu
            ticket={row.original}
            onEdit={handleEditTicket}
            onDelete={(ticket) => {
              setTicketToDelete(ticket);
              setDeleteDialogOpen(true);
            }}
          />
        ),
        enableSorting: false,
        size: 80,
        minSize: 80,
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: false,
    pageCount: meta ? meta.totalPages : undefined,
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
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

  return (
    <Fragment>
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
                  placeholder="Search tickets..."
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

      <DynamicCreateTicketDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateTicket}
        isSubmitting={creating}
      />

      <DynamicEditTicketDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        ticket={ticketToEdit}
        onSubmit={handleUpdateTicket}
        isSubmitting={updating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Support Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete ticket &quot;{ticketToDelete?.title || 'N/A'}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTicket}
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

