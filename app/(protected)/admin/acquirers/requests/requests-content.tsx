'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getMerchantAcquirerRequests,
  updateMerchantAcquirerRequestStatus,
  MerchantAcquirerRequest,
  MerchantAcquirerRequestsResponse,
  MerchantAcquirerRequestsParams,
  UpdateMerchantAcquirerRequestStatusPayload,
} from '@/lib/services/admin/acquirers';
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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
import { AcquirerRequestActionMenu } from './components/acquirer-request-action-menu';
import { useRouter } from 'next/navigation';

export function RequestsContent() {
  const router = useRouter();
  const [requests, setRequests] = useState<MerchantAcquirerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<MerchantAcquirerRequestsResponse['meta'] | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<MerchantAcquirerRequest | null>(null);
  const [requestToReject, setRequestToReject] = useState<MerchantAcquirerRequest | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

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

  const fetchMerchantAcquirerRequests = useCallback(
    async (pageNum: number, pageLimit: number) => {
      setLoading(true);
      try {
        const params: MerchantAcquirerRequestsParams = {
          page: pageNum,
          limit: pageLimit,
        };

        const response = await getMerchantAcquirerRequests(params);
        handleApiResponse<MerchantAcquirerRequestsResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setRequests(Array.isArray(data.data) ? data.data : []);
              setMeta(data.meta);
            } else {
              toast.error('Failed to fetch acquirer requests - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch acquirer requests');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Fetch acquirer requests error:', error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMerchantAcquirerRequests(page, limit);
  }, [page, limit, fetchMerchantAcquirerRequests]);

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      setPagination({
        pageIndex: meta.page - 1, // Convert 1-based to 0-based
        pageSize: meta.limit,
      });
    }
  }, [meta]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery) return requests;

    const searchLower = searchQuery.toLowerCase();
    return requests.filter(
      (item) =>
        item.merchant?.name?.toLowerCase().includes(searchLower) ||
        item.merchant?.email?.toLowerCase().includes(searchLower) ||
        item.acquirerAccount?.name?.toLowerCase().includes(searchLower) ||
        item.acquirerAccount?.terminalId?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, requests]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1); // Convert 0-based to 1-based
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setLimit(newPageSize);
    setPage(1); // Reset to first page when page size changes
  };

  const handleApproveRequest = async () => {
    if (!requestToApprove) return;

    setApproving(true);
    try {
      const payload: UpdateMerchantAcquirerRequestStatusPayload = {
        status: 'approved'
      };

      const response = await updateMerchantAcquirerRequestStatus(requestToApprove.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(`Request for ${requestToApprove.merchant.name} approved successfully!`);
          setApproveDialogOpen(false);
          setRequestToApprove(null);
          fetchMerchantAcquirerRequests(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to approve request');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Approve request error:', error);
    } finally {
      setApproving(false);
    }
  };

  const handleRejectRequest = async () => {
    if (!requestToReject) return;

    setRejecting(true);
    try {
      const payload: UpdateMerchantAcquirerRequestStatusPayload = {
        status: 'rejected'
      };

      const response = await updateMerchantAcquirerRequestStatus(requestToReject.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(`Request for ${requestToReject.merchant.name} rejected successfully!`);
          setRejectDialogOpen(false);
          setRequestToReject(null);
          fetchMerchantAcquirerRequests(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to reject request');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Reject request error:', error);
    } finally {
      setRejecting(false);
    }
  };

  const handleViewRequest = (request: MerchantAcquirerRequest) => {
    router.push(`/admin/acquirers/requests/${request.id}`);
  };

  const getStatusBadgeVariant = (status: string): 'primary' | 'destructive' | 'secondary' | 'success' | 'warning' | 'info' => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      case 'pending':
        return 'warning';
      default:
        return 'primary';
    }
  };


  const columns = useMemo<ColumnDef<MerchantAcquirerRequest>[]>(() => [
    {
      id: 'merchantName',
      accessorFn: (row) => row.merchant?.name || '',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Merchant" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            {row.original.merchant?.name || '-'}
          </div>
        );
      },
    },
    {
      id: 'merchantEmail',
      accessorFn: (row) => row.merchant?.email || '',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[200px] truncate text-muted-foreground">
            {row.original.merchant?.email || '-'}
          </div>
        );
      },
    },
    {
      id: 'acquirerAccountName',
      accessorKey: 'acquirerAccount.name',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Acquirer Account" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[200px] truncate">
            {row.original.acquirerAccount?.name || '-'}
          </div>
        );
      },
    },
    {
      id: 'terminalId',
      accessorKey: 'acquirerAccount.terminalId',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Terminal ID" />
      ),
      cell: ({ row }) => {
        return (
          <div className="font-mono text-sm">
            {row.original.acquirerAccount?.terminalId || '-'}
          </div>
        );
      },
    },
    {
      id: 'processingCurrency',
      accessorKey: 'processingCurrency',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Currencies" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[150px] truncate">
            {row.original.processingCurrency?.join(', ') || '-'}
          </div>
        );
      },
    },
    {
      id: 'paymentMethods',
      accessorKey: 'acceptedPaymentMethods',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Payment Methods" />
      ),
      cell: ({ row }) => {
        return (
          <div className="max-w-[150px] truncate">
            {row.original.acceptedPaymentMethods?.join(', ') || '-'}
          </div>
        );
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
          <div className="max-w-[250px] truncate text-muted-foreground">
            {row.original.description || '-'}
          </div>
        );
      },
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Requested At" />
      ),
      cell: ({ row }) => {
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
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
        const status = row.original.status;
        return (
          <Badge variant={getStatusBadgeVariant(status)}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Actions" />
      ),
      cell: ({ row }) => (
        <AcquirerRequestActionMenu
          request={row.original}
          onView={handleViewRequest}
          onApprove={(request) => {
            setRequestToApprove(request);
            setApproveDialogOpen(true);
          }}
          onReject={(request) => {
            setRequestToReject(request);
            setRejectDialogOpen(true);
          }}
        />
      ),
      enableSorting: false,
      size: 100,
    },
  ], []);

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
      <DataGrid
        table={table}
        recordCount={meta?.total || filteredData.length}
        isLoading={loading}
        tableLayout={modernTableLayout}
        tableClassNames={modernTableClassNames}
      >
        <Card className={modernTableCardClasses.card}>
          <CardHeader className={modernTableCardClasses.header}>
            <CardHeading>
              <div className="relative w-full max-w-sm">
                <Input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-3"
                />
              </div>
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

      {/* Approve Request Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Acquirer Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the acquirer request for{' '}
              <strong>{requestToApprove?.merchant.name}</strong>?
              This will enable the acquirer account for this merchant.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveRequest}
              disabled={approving}
              className="bg-green-600 hover:bg-green-700"
            >
              {approving ? 'Approving...' : 'Approve Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Request Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Acquirer Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject the acquirer request for{' '}
              <strong>{requestToReject?.merchant.name}</strong>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectRequest}
              disabled={rejecting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejecting ? 'Rejecting...' : 'Reject Request'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Fragment>
  );
}

