'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getAcquirerAccounts,
  deleteAcquirerAccount,
  updateAcquirerAccountStatus,
  AcquirerAccount,
  AcquirerAccountListResponse,
} from '@/lib/services/admin/acquirer-accounts';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Badge } from '@/components/ui/badge';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
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
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Search, X, Pencil, Trash2, Plus } from 'lucide-react';
import { Switch, SwitchWrapper } from '@/components/ui/switch';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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

export default function AdminAcquirerAccountsPage() {
  const [acquirerAccounts, setAcquirerAccounts] = useState<AcquirerAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<AcquirerAccount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string | number, boolean>>({});
  const [meta, setMeta] = useState<AcquirerAccountListResponse['data']['meta'] | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchAcquirerAccounts = useCallback(async (pageNum: number, pageLimit: number) => {
    setLoading(true);
    try {
      const response = await getAcquirerAccounts({
        page: pageNum,
        limit: pageLimit,
      });
      handleApiResponse<AcquirerAccountListResponse>(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data) {
            setAcquirerAccounts(data.data.data);
            setMeta(data.data.meta);
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
  }, []);

  useEffect(() => {
    fetchAcquirerAccounts(page, limit);
  }, [page, limit, fetchAcquirerAccounts]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
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
              fetchAcquirerAccounts(page, limit);
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to update acquirer account status');
            // Revert optimistic update on error by refetching
            fetchAcquirerAccounts(page, limit);
          },
          onUnauthorized: () => {
            toast.error('Unauthorized. Please check your authentication.');
            fetchAcquirerAccounts(page, limit);
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error('Update status error:', error);
        // Revert optimistic update on error by refetching
        fetchAcquirerAccounts(page, limit);
      } finally {
        setUpdatingStatus((prev) => {
          const updated = { ...prev };
          delete updated[account.id];
          return updated;
        });
      }
    },
    [fetchAcquirerAccounts, page, limit]
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
          fetchAcquirerAccounts(page, limit);
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
  }, [accountToDelete, fetchAcquirerAccounts, page, limit]);

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
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              className="size-7"
              mode="icon"
              variant="ghost"
              asChild
            >
              <Link href={`/admin/acquirers/acquirer-accounts/${row.original.id}/edit`}>
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button
              className="size-7"
              mode="icon"
              variant="ghost"
              asChild
            >
              <Link href={`/admin/acquirers/acquirer-accounts/${row.original.id}/rates`}>
                <Plus className="size-4 text-primary" />
              </Link>
            </Button>
            <Button
              className="size-7"
              mode="icon"
              variant="ghost"
              onClick={() => {
                setAccountToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ),
        enableSorting: false,
        size: 120,
      },
    ],
    [updatingStatus, handleStatusToggle],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
      // Update server-side pagination
      if (newPagination.pageIndex !== page - 1) {
        setPage(newPagination.pageIndex + 1);
      }
      if (newPagination.pageSize !== limit) {
        setLimit(newPagination.pageSize);
        setPage(1);
      }
    },
    getRowId: (row) => String(row.id),
    state: {
      sorting,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
    manualPagination: true,
    pageCount: meta ? meta.totalPages : 0,
  });

  if (loading && acquirerAccounts.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Acquirer Accounts"
              description="Manage and view all acquirer accounts"
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
            title="Acquirer Accounts"
            description="Manage and view all acquirer accounts"
          />
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.totalItems ?? filteredData.length}
          isLoading={loading}
          tableLayout={{
            cellBorder: true,
          }}
        >
          <Card>
            <CardHeader>
              <CardHeading>
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search acquirer accounts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ps-9 w-40"
                    />
                    {searchQuery.length > 0 && (
                      <Button
                        mode="icon"
                        variant="ghost"
                        className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery('')}
                      >
                        <X />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeading>
            </CardHeader>
            <CardTable>
              <ScrollArea>
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
            <CardFooter>
              <DataGridPagination />
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

