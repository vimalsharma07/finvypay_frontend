'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import {
  getRiskManagement,
  deleteRiskManagement,
  createRiskManagement,
  updateRiskManagement,
  RiskManagement,
  RiskManagementListResponse,
} from '@/lib/services/user/risk-management';
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
import { AddRiskDialog } from './components/add-risk-dialog';
import { EditRiskDialog } from './components/edit-risk-dialog';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

export default function ManageRiskPage() {
  const [riskManagement, setRiskManagement] = useState<RiskManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<RiskManagementListResponse['data']['meta'] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [riskToDelete, setRiskToDelete] = useState<RiskManagement | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [riskToEdit, setRiskToEdit] = useState<RiskManagement | null>(null);
  const [updating, setUpdating] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRiskManagement = useCallback(
    async (pageNum: number, pageLimit: number) => {
      setLoading(true);
      try {
        const params = {
          page: pageNum,
          limit: pageLimit,
        };

        const response = await getRiskManagement(params);
        handleApiResponse<RiskManagementListResponse>(response, {
          onSuccess: (data) => {
            // New format: { success: true, data: [...], meta: {...} }
            if (data && data.success && data.data) {
              setRiskManagement(Array.isArray(data.data) ? data.data : []);
              setMeta(data.meta);
            } else {
              toast.error('Failed to fetch risk management - invalid response structure');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to fetch risk management');
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
    fetchRiskManagement(page, limit);
  }, [page, limit, fetchRiskManagement]);

  // Filter data based on search query (client-side)
  const filteredData = useMemo(() => {
    if (!searchQuery) return riskManagement;

    const searchLower = searchQuery.toLowerCase();
    return riskManagement.filter(
      (item) =>
        item.user?.name?.toLowerCase().includes(searchLower) ||
        item.user?.email?.toLowerCase().includes(searchLower) ||
        item.riskType?.toLowerCase().includes(searchLower) ||
        String(item.riskValue)?.toLowerCase().includes(searchLower),
    );
  }, [searchQuery, riskManagement]);

  const handleAddRisk = async (riskType: string, riskValue: string) => {
    setAdding(true);
    try {
      const response = await createRiskManagement({
        riskType,
        riskValue,
      });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Risk management entry created successfully!');
          setAddDialogOpen(false);
          fetchRiskManagement(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create risk management entry');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Create risk management error:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateRisk = async (id: string, riskType: string, riskValue: string) => {
    setUpdating(true);
    try {
      const response = await updateRiskManagement(id, {
        riskType,
        riskValue,
      });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Risk management entry updated successfully!');
          setEditDialogOpen(false);
          setRiskToEdit(null);
          fetchRiskManagement(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to update risk management entry');
        },
        onValidationError: (errors, messages) => {
          console.error('Validation errors:', errors);
          toast.error(Array.isArray(messages) ? messages.join(', ') : messages);
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Update risk management error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteRisk = async () => {
    if (!riskToDelete) return;

    setDeleting(true);
    try {
      const response = await deleteRiskManagement(riskToDelete.id);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Risk management entry deleted successfully!');
          setDeleteDialogOpen(false);
          setRiskToDelete(null);
          fetchRiskManagement(page, limit);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to delete risk management entry');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete risk management error:', error);
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

  // Update pagination when meta changes
  useEffect(() => {
    if (meta) {
      setPagination({
        pageIndex: meta.currentPage - 1, // Convert 1-based to 0-based
        pageSize: meta.itemsPerPage,
      });
    }
  }, [meta]);

  const columns = useMemo<ColumnDef<RiskManagement>[]>(
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
        id: 'riskValue',
        accessorKey: 'riskValue',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Risk Value" />
        ),
        cell: ({ row }) => {
          return <div>{row.original.riskValue ?? '-'}</div>;
        },
      },
      {
        id: 'riskType',
        accessorKey: 'riskType',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Risk Type" />
        ),
        cell: ({ row }) => {
          return <div className="capitalize">{row.original.riskType || '-'}</div>;
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
            onEdit={(risk) => {
              setRiskToEdit(risk);
              setEditDialogOpen(true);
            }}
            onDelete={(risk) => {
              setRiskToDelete(risk);
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

  if (loading && riskManagement.length === 0) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Manage Risk"
              description="Configure and manage risk management rules, fraud detection settings, and transaction security thresholds"
              icon={ShieldCheck}
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
            title="Manage Risk"
            description="Manage and view all risk management entries"
          />
          <ToolbarActions>
            <Button variant="primary" onClick={() => setAddDialogOpen(true)}>
              Create Risk
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
                  placeholder="Search risks..."
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

      <AddRiskDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddRisk}
        isSubmitting={adding}
      />

      <EditRiskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        riskManagement={riskToEdit}
        onSubmit={handleUpdateRisk}
        isSubmitting={updating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Risk Management Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete risk &quot;{riskToDelete?.riskValue || 'N/A'}&quot; (Type: {riskToDelete?.riskType || 'N/A'}) for user &quot;{riskToDelete?.user?.name || 'N/A'}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRisk}
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

