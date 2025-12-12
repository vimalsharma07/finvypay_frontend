'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  Row,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { EllipsisVertical, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardFooter,
  CardHeader,
  CardHeading,
  CardTable,
} from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import Link from 'next/link';
import { User } from '@/lib/services/admin/users';

// Header definition matching old project pattern
export interface TableHeader<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

// Action definition
export interface TableAction<T> {
  label: string;
  route?: (row: T) => string;
  onClick?: (row: T) => void;
  variant?: 'destructive';
  separator?: boolean;
}

// Props interface
export interface TableCompProps<T> {
  data: T[];
  headers: TableHeader<T>[];
  renderCell?: (item: T, key: keyof T | string) => React.ReactNode;
  renderAction?: (item: T) => React.ReactNode;
  actions?: TableAction<T>[]; // For default action dropdown
  enableCheckbox?: boolean;
  searchPlaceholder?: string;
  searchKeys?: (keyof T | string)[];
  getRowId: (row: T) => string;
  // Server-side pagination
  pagination?: {
    pageSize?: number;
    pageIndex?: number;
    totalCount?: number;
    onPageChange?: (pageIndex: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  // Server-side sorting
  sorting?: {
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    onSortChange?: (sortBy: string, sortOrder: 'ASC' | 'DESC') => void;
  };
  onSearch?: (query: string) => void;
  loading?: boolean;
}

// Default Actions Cell Component
function DefaultActionsCell<T>({
  row,
  actions,
}: {
  row: Row<T>;
  actions: TableAction<T>[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="size-7" mode="icon" variant="ghost">
          <EllipsisVertical />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        {actions.map((action, index) => {
          const shouldShowSeparator = action.separator && index > 0;

          if (action.route) {
            return (
              <Fragment key={index}>
                {shouldShowSeparator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  asChild
                  {...(action.variant && { variant: action.variant })}
                >
                  <Link href={action.route(row.original)}>
                    {action.label}
                  </Link>
                </DropdownMenuItem>
              </Fragment>
            );
          }

          return (
            <Fragment key={index}>
              {shouldShowSeparator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                {...(action.variant && { variant: action.variant })}
                onClick={() => action.onClick?.(row.original)}
              >
                {action.label}
              </DropdownMenuItem>
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function TableComp<T extends Record<string, any>>({
  data,
  headers,
  renderCell,
  renderAction,
  actions,
  enableCheckbox = false,
  searchPlaceholder = 'Search...',
  searchKeys,
  getRowId,
  pagination = { pageSize: 10 },
  sorting: sortingConfig,
  onSearch,
  loading = false,
}: TableCompProps<T>) {
  // Server-side sorting state
  const [sorting, setSorting] = useState<SortingState>(() => {
    if (sortingConfig?.sortBy) {
      return [
        {
          id: sortingConfig.sortBy,
          desc: sortingConfig.sortOrder === 'DESC',
        },
      ];
    }
    return [];
  });

  // Server-side pagination state
  const [paginationState, setPaginationState] = useState<PaginationState>({
    pageIndex: pagination.pageIndex ?? 0,
    pageSize: pagination.pageSize || 10,
  });

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Update pagination state when prop changes
  useEffect(() => {
    if (pagination.pageIndex !== undefined) {
      setPaginationState((prev) => ({
        ...prev,
        pageIndex: pagination.pageIndex!,
      }));
    }
    if (pagination.pageSize) {
      setPaginationState((prev) => ({
        ...prev,
        pageSize: pagination.pageSize!,
      }));
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  // Update sorting state when prop changes
  useEffect(() => {
    if (sortingConfig?.sortBy) {
      setSorting([
        {
          id: sortingConfig.sortBy,
          desc: sortingConfig.sortOrder === 'DESC',
        },
      ]);
    }
  }, [sortingConfig?.sortBy, sortingConfig?.sortOrder]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) {
      if (onSearch) {
        onSearch('');
      }
      return data;
    }

    if (onSearch) {
      onSearch(searchQuery);
    }

    const searchLower = searchQuery.toLowerCase();
    return data.filter((item) => {
      if (searchKeys && searchKeys.length > 0) {
        return searchKeys.some((key) => {
          const value = item[key as keyof T];
          return value
            ? String(value).toLowerCase().includes(searchLower)
            : false;
        });
      }
      // Default: search all string values
      return Object.values(item).some((value) =>
        value ? String(value).toLowerCase().includes(searchLower) : false,
      );
    });
  }, [searchQuery, data, searchKeys, onSearch]);

  // Build columns for react-table from headers
  const tableColumns = useMemo<ColumnDef<T>[]>(() => {
    const cols: ColumnDef<T>[] = [];

    // Add checkbox column if enabled
    if (enableCheckbox) {
      cols.push({
        id: 'select',
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 50,
      });
    }

    // Add columns from headers
    headers.forEach((header) => {
      cols.push({
        id: String(header.key),
        accessorKey: header.key as string,
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title={header.label}
          />
        ),
        cell: ({ row }) => {
          if (renderCell) {
            return renderCell(row.original, header.key);
          }
          // Default rendering
          const value = row.original[header.key as keyof T];
          return (
            <div className="text-foreground font-normal">
              {value != null ? String(value) : '-'}
            </div>
          );
        },
        enableSorting: header.sortable !== false,
        size: header.width ? parseInt(header.width) : undefined,
        meta: {
          headerClassName: header.align
            ? `text-${header.align}`
            : undefined,
        },
      });
    });

    // Add actions column if renderAction or actions are provided
    if (renderAction || (actions && Array.isArray(actions))) {
      cols.push({
        id: 'actions',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Actions" />
        ),
        cell: ({ row }) => {
          if (renderAction) {
            return renderAction(row.original);
          }
          if (actions && Array.isArray(actions)) {
            return <DefaultActionsCell row={row} actions={actions} />;
          }
          return null;
        },
        enableSorting: false,
        size: 60,
      });
    }

    return cols;
  }, [headers, enableCheckbox, renderCell, renderAction, actions]);

  // Handle sorting change
  const handleSortingChange = (updater: SortingState | ((old: SortingState) => SortingState)) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    setSorting(newSorting);

    if (sortingConfig?.onSortChange && newSorting.length > 0) {
      const sort = newSorting[0];
      sortingConfig.onSortChange(
        sort.id,
        sort.desc ? 'DESC' : 'ASC'
      );
    }
  };

  // Handle pagination change
  const handlePaginationChange = (updater: PaginationState | ((old: PaginationState) => PaginationState)) => {
    const newPagination = typeof updater === 'function' ? updater(paginationState) : updater;
    const pageSizeChanged = newPagination.pageSize !== paginationState.pageSize;
    const pageIndexChanged = newPagination.pageIndex !== paginationState.pageIndex;

    setPaginationState(newPagination);

    // Handle page size change
    if (pageSizeChanged && pagination.onPageSizeChange) {
      pagination.onPageSizeChange(newPagination.pageSize);
      // Reset to first page when changing page size
      if (pagination.onPageChange) {
        pagination.onPageChange(0);
      }
    }
    // Handle page index change
    else if (pageIndexChanged && pagination.onPageChange) {
      pagination.onPageChange(newPagination.pageIndex);
    }
  };

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    // Only use client-side filtering if not using server-side
    getFilteredRowModel: getFilteredRowModel(),
    // Disable client-side pagination if using server-side
    manualPagination: !!pagination.onPageChange,
    manualSorting: !!sortingConfig?.onSortChange,
    pageCount: pagination.totalCount
      ? Math.ceil(pagination.totalCount / paginationState.pageSize)
      : undefined,
    getPaginationRowModel: pagination.onPageChange ? undefined : getPaginationRowModel(),
    getSortedRowModel: sortingConfig?.onSortChange ? undefined : getSortedRowModel(),
    enableRowSelection: enableCheckbox,
    onRowSelectionChange: enableCheckbox ? setRowSelection : undefined,
    onSortingChange: handleSortingChange,
    onPaginationChange: handlePaginationChange,
    getRowId: (row) => getRowId(row),
    state: {
      sorting,
      pagination: paginationState,
      ...(enableCheckbox && { rowSelection }),
    },
  });

  // Use totalCount from pagination if provided (server-side), otherwise use filteredData length
  const recordCount = pagination.totalCount ?? filteredData.length;

  return (
    <DataGrid
      table={table}
      recordCount={recordCount}
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
                  placeholder={searchPlaceholder}
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
  );
}
