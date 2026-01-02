'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { LifeBuoy } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getSupportTickets,
  closeSupportTicket,
  reopenSupportTicket,
  SupportTicket,
  SupportTicketListResponse,
} from '@/lib/services/admin/support-ticket';
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
import { TicketActionMenu } from './components/ticket-action-menu';
import { SearchInput } from './components/search-input';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<SupportTicketListResponse['data']['meta'] | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [ticketToClose, setTicketToClose] = useState<SupportTicket | null>(null);
  const [ticketToReopen, setTicketToReopen] = useState<SupportTicket | null>(null);
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);

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
            // New format: { success: true, data: [...], meta: {...} }
            if (data && data.success && data.data) {
              setTickets(Array.isArray(data.data) ? data.data : []);
              setMeta(data.meta);
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
        pageIndex: meta.currentPage - 1, // Convert 1-based to 0-based
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
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.priority?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, tickets]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1); // Convert 0-based to 1-based
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    toast.info(`View ticket: ${ticket.title}`);
    // TODO: Implement view ticket modal or navigate to detail page
  };

  const handleReopenTicket = async () => {
    if (!ticketToReopen) return;

    setReopening(true);
    try {
      const response = await reopenSupportTicket(ticketToReopen.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Ticket reopened successfully!');
          setReopenDialogOpen(false);
          setTicketToReopen(null);
          fetchSupportTickets(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to reopen ticket');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Reopen ticket error:', error);
    } finally {
      setReopening(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!ticketToClose) return;

    setClosing(true);
    try {
      const response = await closeSupportTicket(ticketToClose.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Ticket closed successfully!');
          setCloseDialogOpen(false);
          setTicketToClose(null);
          fetchSupportTickets(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to close ticket');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Close ticket error:', error);
    } finally {
      setClosing(false);
    }
  };

  const getPriorityBadgeVariant = (priority: string): 'primary' | 'destructive' | 'secondary' | 'warning' | 'info' => {
    switch (priority) {
      case 'URGENT':
        return 'destructive';
      case 'HIGH':
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
        id: 'userName',
        accessorFn: (row) => row.user?.name || '',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          return <div className="font-medium">{row.original.user?.name || '-'}</div>;
        },
      },
      {
        id: 'title',
        accessorKey: 'title',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
          return <div className="max-w-[300px] truncate">{row.original.title || '-'}</div>;
        },
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
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => (
          <TicketActionMenu
            ticket={row.original}
            onView={handleViewTicket}
            onReopen={(ticket) => {
              setTicketToReopen(ticket);
              setReopenDialogOpen(true);
            }}
            onClose={(ticket) => {
              setTicketToClose(ticket);
              setCloseDialogOpen(true);
            }}
          />
        ),
        enableSorting: false,
        size: 100,
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
    manualSorting: false, // Client-side sorting
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

  if (loading && tickets.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Support Tickets"
              description="View, respond to, and manage customer support tickets with status tracking and resolution management"
              icon={LifeBuoy}
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
            title="Support Tickets"
            description="Manage and view all support tickets"
          />
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

      {/* Close Ticket Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close Support Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to close ticket &quot;{ticketToClose?.title || 'N/A'}&quot;? This action can be undone by reopening the ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseTicket}
              disabled={closing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {closing ? 'Closing...' : 'Close Ticket'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reopen Ticket Dialog */}
      <AlertDialog open={reopenDialogOpen} onOpenChange={setReopenDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen Support Ticket</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reopen ticket &quot;{ticketToReopen?.title || 'N/A'}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reopening}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReopenTicket}
              disabled={reopening}
            >
              {reopening ? 'Reopening...' : 'Reopen Ticket'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}

