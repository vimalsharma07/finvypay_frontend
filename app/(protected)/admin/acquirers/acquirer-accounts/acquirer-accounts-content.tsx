'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/components/common/container';
import {
  getAcquirerAccounts,
  deleteAcquirerAccount,
  updateAcquirerAccountStatus,
  AcquirerAccount,
  AcquirerAccountListResponse,
} from '@/lib/services/admin/acquirer-accounts';
import { getAcquirerById, Acquirer } from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Badge } from '@/components/ui/badge';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
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
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X, Pencil, Trash2, Plus } from 'lucide-react';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TableActionMenu, TableActionMenuItem } from '@/app/(protected)/components/table-action-menu';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';
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
import { getIconUrl as getS3IconUrl } from '@/lib/s3-url';

// Helper function to get icon URL from publicId (uses dynamic S3 URL)
const getIconUrl = getS3IconUrl;

export function AcquirerAccountsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const acquirerIdFromUrl = searchParams.get('acquirerId');
  
  const [acquirerAccounts, setAcquirerAccounts] = useState<AcquirerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [acquirer, setAcquirer] = useState<Acquirer | null>(null);
  const [loadingAcquirer, setLoadingAcquirer] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AcquirerAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string | number, boolean>>({});
  const [meta, setMeta] = useState<CursorPaginationMeta | null>(null);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);

  const fetchAcquirerAccounts = useCallback(async (cursor: string | undefined, pageLimit: number) => {
    setLoading(true);
    try {
      const params: { cursor?: string; limit: number; acquirerId?: number } = {
        ...(cursor ? { cursor } : {}),
        limit: pageLimit,
      };
      
      if (acquirerIdFromUrl) {
        params.acquirerId = parseInt(acquirerIdFromUrl, 10);
      }
      
      const response = await getAcquirerAccounts(params);
      handleApiResponse<AcquirerAccountListResponse>(response, {
        onSuccess: (data) => {
          // New format: { success: true, data: [...], meta: {...} }
          if (data && data.success && data.data) {
            setAcquirerAccounts(data.data);
            setMeta(data.meta ?? null);
            
            // If we have accounts and acquirerId, try to get acquirer name from first account
            if (data.data.length > 0 && data.data[0].acquirer?.acquirerName) {
              setAcquirer({
                id: acquirerIdFromUrl || '',
                acquirerName: data.data[0].acquirer.acquirerName,
                fileName: data.data[0].acquirer.fileName || '',
                iconUrl: data.data[0].acquirer.iconUrl,
                fields: {},
                status: '',
                isDeleted: false,
                createdAt: '',
                updatedAt: '',
              });
            }
          } else {
            toast.error('Failed to fetch acquirer accounts - invalid response structure');
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to fetch acquirer accounts');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Fetch acquirer accounts error:', error);
    } finally {
      setLoading(false);
    }
  }, [acquirerIdFromUrl]);

  // Fetch acquirer details when acquirerId is present
  useEffect(() => {
    if (acquirerIdFromUrl) {
      setLoadingAcquirer(true);
      getAcquirerById(acquirerIdFromUrl).then((response) => {
        handleApiResponse<Acquirer>(response, {
          onSuccess: (data) => {
            setAcquirer(data);
          },
          onError: () => {
            // Silently fail - we'll try to get name from accounts
          },
        });
        setLoadingAcquirer(false);
      }).catch(() => {
        setLoadingAcquirer(false);
      });
    } else {
      setAcquirer(null);
    }
  }, [acquirerIdFromUrl]);

  useEffect(() => {
    resetCursor();
  }, [acquirerIdFromUrl, resetCursor]);

  useEffect(() => {
    fetchAcquirerAccounts(requestCursor, limit);
  }, [requestCursor, limit, acquirerIdFromUrl, fetchAcquirerAccounts]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  useEffect(() => {
    setPagination((p) => ({ ...p, pageSize: limit, pageIndex: 0 }));
  }, [limit]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return acquirerAccounts;

    const searchLower = searchQuery.toLowerCase();
    return acquirerAccounts.filter((account) => {
      const acquirerName = account.acquirer?.acquirerName?.toLowerCase() || '';
      const name = account.name?.toLowerCase() || '';
      const currency = account.currency?.toLowerCase() || '';
      const providerType = account.providerType?.toLowerCase() || '';
      const flowType = account.flowType?.toLowerCase() || '';
      const status = account.status?.toLowerCase() || '';

      return (
        acquirerName.includes(searchLower) ||
        name.includes(searchLower) ||
        currency.includes(searchLower) ||
        providerType.includes(searchLower) ||
        flowType.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [searchQuery, acquirerAccounts]);

  const handleStatusToggle = useCallback(
    async (account: AcquirerAccount, newStatus: 'active' | 'inactive') => {
      if (!account?.id) {
        toast.error('Invalid acquirer account');
        return;
      }

      setUpdatingStatus((prev) => ({ ...prev, [account.id]: true }));

      try {
        const response = await updateAcquirerAccountStatus(account.id, { status: newStatus });

        handleApiResponse(response, {
          onSuccess: (updatedAccount) => {
            if (updatedAccount?.status) {
              // Optimistic update: update local state immediately
              setAcquirerAccounts((prev) =>
                prev.map((acc) =>
                  acc.id === account.id ? { ...acc, status: updatedAccount.status } : acc
                )
              );
              toast.success(`Acquirer account status updated to ${newStatus}`);
            } else {
              // Fallback: refetch data if response doesn't include updated status
              toast.success('Acquirer account status updated successfully');
              fetchAcquirerAccounts(requestCursor, limit);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to update acquirer account status');
            // Revert optimistic update on error by refetching
            fetchAcquirerAccounts(requestCursor, limit);
          },
          onUnauthorized: () => {
            toast.error('Unauthorized. Please check your authentication.');
            fetchAcquirerAccounts(requestCursor, limit);
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Update status error:', error);
        // Revert optimistic update on error by refetching
        fetchAcquirerAccounts(requestCursor, limit);
      } finally {
        setUpdatingStatus((prev) => {
          const updated = { ...prev };
          delete updated[account.id];
          return updated;
        });
      }
    },
    [fetchAcquirerAccounts, requestCursor, limit]
  );

  const handleDeleteAcquirerAccount = useCallback(async () => {
    if (!accountToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteAcquirerAccount(accountToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Acquirer account deleted successfully!');
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
          fetchAcquirerAccounts(requestCursor, limit);
        },
          onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete acquirer account');
        },
        onUnauthorized: () => {
          toast.error('Unauthorized. Please check your authentication.');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete acquirer account error:', error);
    } finally {
      setDeleting(false);
    }
  }, [accountToDelete, fetchAcquirerAccounts, requestCursor, limit]);

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const columns = useMemo<ColumnDef<AcquirerAccount>[]>(
    () => [
      {
        accessorKey: 'acquirer.acquirerName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Acquirer Name" />
        ),
        cell: ({ row }) => {
          return (
            <div className="font-medium">
              {row.original.acquirer?.acquirerName || '-'}
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          return <div className="font-medium">{row.original.name}</div>;
        },
      },
      {
        accessorKey: 'currency',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Currency" />
        ),
        cell: ({ row }) => {
          return <div className="text-muted-foreground">{row.original.currency}</div>;
        },
      },
      {
        accessorKey: 'providerType',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Provider Type" />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant="secondary" className="capitalize">
              {row.original.providerType}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'flowType',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Flow Type" />
        ),
        cell: ({ row }) => {
          return (
            <Badge variant="outline" className="capitalize">
              {row.original.flowType}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const account = row.original;
          const currentStatus = account?.status?.toLowerCase() || 'inactive';
          const isActive = currentStatus === 'active';
          const isUpdating = updatingStatus[account.id] || false;

          return (
            <SwitchWrapper>
              <Switch
                checked={isActive}
                onCheckedChange={(checked) => {
                  const newStatus = checked ? 'active' : 'inactive';
                  handleStatusToggle(account, newStatus);
                }}
                disabled={isUpdating}
                size="sm"
              />
            </SwitchWrapper>
          );
        },
      },
      {
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Action" />
        ),
        cell: ({ row }) => {
          const actions: TableActionMenuItem<AcquirerAccount>[] = [
            {
              label: 'Edit',
              icon: Pencil,
              route: (account) => `/admin/acquirers/acquirer-accounts/${account.id}/edit`,
            },
            {
              label: 'Add Rates',
              icon: Plus,
              route: (account) => `/admin/acquirers/acquirer-accounts/${account.id}/rates`,
            },
            {
              label: 'Delete',
              icon: Trash2,
              onClick: (account) => {
                setAccountToDelete(account);
                setDeleteDialogOpen(true);
              },
              variant: 'destructive',
              separator: true,
            },
          ];

          return <TableActionMenu row={row.original} actions={actions} />;
        },
        enableSorting: false,
        size: 80,
      },
    ],
    [updatingStatus, handleStatusToggle],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      pagination: {
        pageIndex: 0,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: 1,
  });

  return (
    <Fragment>
      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalCount ?? acquirerAccounts.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
        <Card className={modernTableCardClasses.card}>
          <CardHeader className={modernTableCardClasses.header}>
            <CardHeading>
              <div className="relative w-full max-w-lg my-2 group">
                <Search className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none size-4.5 transition-all duration-200",
                  searchQuery 
                    ? "text-primary" 
                    : "text-muted-foreground group-focus-within:text-primary"
                )} />
                <Input
                  placeholder="Search acquirer accounts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-11 pr-10 h-9 text-sm w-full",
                    "bg-background border-border/60",
                    "focus-visible:border-primary/50 focus-visible:ring-primary/20",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md focus-visible:shadow-lg",
                    searchQuery && "border-primary/30 bg-primary/5"
                  )}
                />
                {searchQuery.length > 0 && (
                  <Button
                    mode="icon"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-md hover:bg-muted/80 transition-colors"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="size-3.5 text-muted-foreground hover:text-foreground" />
                  </Button>
                )}
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
      </Container>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Acquirer Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete acquirer account &quot;{accountToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAcquirerAccount}
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

