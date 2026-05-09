'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TicketActionMenu } from './components/ticket-action-menu';
import { AlertTriangle, ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { SearchInput } from './components/search-input';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

export function SupportTicketsPageContent() {
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [reopenDialogOpen, setReopenDialogOpen] = useState(false);
  const [ticketToClose, setTicketToClose] = useState<SupportTicket | null>(null);
  const [ticketToReopen, setTicketToReopen] = useState<SupportTicket | null>(null);
  const [closing, setClosing] = useState(false);
  const [reopening, setReopening] = useState(false);

  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting state
  const [sorting, setSorting] = useState<SortingState>([]);

  // Pagination state for table
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const fetchSupportTickets = useCallback(
    async (cursor: string | undefined, pageLimit: number) => {
      setLoading(true);
      try {
        const params = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
        };

        const response = await getSupportTickets(params);
        handleApiResponse<SupportTicketListResponse>(response, {
          onSuccess: (data) => {
            if (data?.success && Array.isArray(data.data)) {
              setTickets(data.data);
              setMeta(data.meta ?? null);
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
    fetchSupportTickets(requestCursor, limit);
  }, [requestCursor, limit, fetchSupportTickets]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery) return tickets;

    const searchLower = searchQuery.toLowerCase();
    return tickets.filter(
      (item) =>
        String(item.id).toLowerCase().includes(searchLower) ||
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.title?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.priority?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, tickets]);

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    resetCursor();
  };

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const handleViewTicket = (ticket: SupportTicket) => {
    if (!ticket?.id) {
      toast.error('Unable to open ticket. Missing ticket ID.');
      return;
    }

    router.push(`/admin/support/tickets/${ticket.id}`);
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
          fetchSupportTickets(requestCursor, limit);
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
          fetchSupportTickets(requestCursor, limit);
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
      },
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
          const value = row.original.priority;
          return (
            <Badge
              variant={getPriorityBadgeVariant(value)}
              className="flex items-center gap-1"
            >
              {value === 'LOW' && <ArrowDownRight className="size-3.5" />}
              {value === 'MEDIUM' && <Minus className="size-3.5" />}
              {value === 'HIGH' && <ArrowUpRight className="size-3.5" />}
              {value === 'CRITICAL' && <AlertTriangle className="size-3.5" />}
              {value}
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
    [handleViewTicket, pagination, sorting, meta]
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
        handlePageSizeChange(newPagination.pageSize);
        setPagination({ pageIndex: 0, pageSize: newPagination.pageSize });
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

