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
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
import { AcquirerRequestActionMenu } from './components/acquirer-request-action-menu';
import { useRouter } from 'next/navigation';

export function RequestsContent() {
  const router = useRouter();
  const [requests, setRequests] = useState<MerchantAcquirerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [requestToApprove, setRequestToApprove] = useState<MerchantAcquirerRequest | null>(null);
  const [requestToReject, setRequestToReject] = useState<MerchantAcquirerRequest | null>(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

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

  const fetchMerchantAcquirerRequests = useCallback(
    async (cursor: string | undefined, pageLimit: number) => {
      setLoading(true);
      try {
        const params: MerchantAcquirerRequestsParams = {
          ...(cursor ? { cursor } : {}),
          limit: pageLimit,
        };

        const response = await getMerchantAcquirerRequests(params);
        handleApiResponse<MerchantAcquirerRequestsResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setRequests(Array.isArray(data.data) ? data.data : []);
              setMeta(data.meta ?? null);
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
    fetchMerchantAcquirerRequests(requestCursor, limit);
  }, [requestCursor, limit, fetchMerchantAcquirerRequests]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery) return requests;

    const searchLower = searchQuery.toLowerCase();
    return requests.filter(
      (item) =>
        item.merchantProfile?.merchantProfileName?.toLowerCase().includes(searchLower) ||
        item.merchant?.name?.toLowerCase().includes(searchLower) ||
        item.merchant?.email?.toLowerCase().includes(searchLower) ||
        item.status?.toLowerCase().includes(searchLower) ||
        String(item.processingVolume ?? '').toLowerCase().includes(searchLower),
    );
  }, [searchQuery, requests]);

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

  const handleApproveRequest = async () => {
    if (!requestToApprove) return;

    setApproving(true);
    try {
      const payload: UpdateMerchantAcquirerRequestStatusPayload = {
        status: 'approved',
      };

      const response = await updateMerchantAcquirerRequestStatus(requestToApprove.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(`Request for ${requestToApprove.merchantProfile?.merchantProfileName ?? requestToApprove.merchant?.name} approved successfully!`);
          setApproveDialogOpen(false);
          setRequestToApprove(null);
          fetchMerchantAcquirerRequests(requestCursor, limit);
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
        status: 'rejected',
      };

      const response = await updateMerchantAcquirerRequestStatus(requestToReject.id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(`Request for ${requestToReject.merchantProfile?.merchantProfileName ?? requestToReject.merchant?.name} rejected successfully!`);
          setRejectDialogOpen(false);
          setRequestToReject(null);
          fetchMerchantAcquirerRequests(requestCursor, limit);
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
      id: 'sno',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="S.No" />
      ),
      cell: ({ row }) => {
        const sno = pagination.pageIndex * pagination.pageSize + row.index + 1;
        return <div className="text-sm">{sno}</div>;
      },
      enableSorting: false,
      size: 70,
    },
    {
      id: 'merchantProfileName',
      accessorFn: (row) => row.merchantProfile?.merchantProfileName || '',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Merchant Profile" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.merchantProfile?.merchantProfileName || '-'}
        </div>
      ),
    },
    {
      id: 'processingVolume',
      accessorFn: (row) => row.processingVolume ?? '',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Processing Volume" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.processingVolume != null ? String(row.original.processingVolume) : '-'}
        </div>
      ),
    },
    {
      id: 'acceptedPaymentMethods',
      accessorKey: 'acceptedPaymentMethods',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Accepted Payment Methods" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {(row.original.acceptedPaymentMethods || []).length > 0 ? (
            row.original.acceptedPaymentMethods.map((m) => (
              <Badge key={m} variant="secondary" className="capitalize text-xs">
                {m}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      id: 'processingCurrency',
      accessorKey: 'processingCurrency',
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Processing Currency" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1 max-w-[150px]">
          {(row.original.processingCurrency || []).length > 0 ? (
            row.original.processingCurrency.map((c) => (
              <Badge key={c} variant="outline" className="text-xs">
                {c}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      ),
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

      {/* Approve Request Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Acquirer Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve the acquirer request for{' '}
              <strong>{requestToApprove?.merchantProfile?.merchantProfileName ?? requestToApprove?.merchant?.name}</strong>?
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
              <strong>{requestToReject?.merchantProfile?.merchantProfileName ?? requestToReject?.merchant?.name}</strong>?
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

