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
import { EllipsisVertical, Search, X, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
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
import { CursorDataGridPagination } from '@/components/ui/cursor-data-grid-pagination';
import type { CursorPaginationMeta } from '@/lib/types/pagination';
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
import type { DataGridProps } from '@/components/ui/data-grid';

/**
 * Shared table layout configuration for modern fintech design
 */
export const modernTableLayout: DataGridProps<any>['tableLayout'] = {
  cellBorder: false,
  rowBorder: true,
  rowRounded: false,
  stripped: true,
  headerBackground: true,
  headerBorder: true,
  headerSticky: true,
  width: 'fixed',
};

/**
 * Shared table class names for modern fintech design
 */
export const modernTableClassNames: DataGridProps<any>['tableClassNames'] = {
  base: 'text-sm',
  header:
    'bg-sky-50/70 border-b border-sky-100/90 dark:bg-sky-950/35 dark:border-sky-900/50',
  headerRow: 'h-12 bg-transparent [&>th]:text-xs [&>th]:font-semibold [&>th]:uppercase [&>th]:tracking-[0.06em] [&>th]:text-slate-500 dark:[&>th]:text-slate-400',
  headerSticky:
    'sticky top-0 z-10 bg-sky-50/95 backdrop-blur-md border-b border-sky-100 shadow-[0_1px_0_0_rgba(14,165,233,0.08)] dark:bg-sky-950/90 dark:border-sky-900/50',
  body: '',
  bodyRow:
    'h-12 border-b border-sky-100/70 transition-colors duration-150 odd:bg-sky-50/35 hover:bg-sky-100/55 dark:border-sky-900/40 dark:odd:bg-sky-950/20 dark:hover:bg-sky-950/40',
  edgeCell: 'first:ps-5 last:pe-5',
};

/**
 * Shared Card class names for modern table containers
 */
export const modernTableCardClasses = {
  card:
    'overflow-hidden rounded-2xl border border-sky-100 bg-card shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40',
  header:
    'border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20',
  table: 'overflow-hidden',
  footer:
    'border-t border-sky-100/80 bg-sky-50/30 dark:border-sky-900/40 dark:bg-sky-950/20',
};

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
  icon?: LucideIcon;
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
  // Server-side pagination (offset) or page size only when using cursorPagination
  pagination?: {
    pageSize?: number;
    pageIndex?: number;
    totalCount?: number;
    onPageChange?: (pageIndex: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
  /** When set, footer uses prev/next cursors instead of page numbers */
  cursorPagination?: {
    meta: CursorPaginationMeta | null;
    onNext: () => void;
    onPrev: () => void;
    canGoPrev: boolean;
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

          const IconComponent = action.icon;
          
          if (action.route) {
            return (
              <Fragment key={index}>
                {shouldShowSeparator && <DropdownMenuSeparator />}
                <DropdownMenuItem
                  asChild
                  {...(action.variant && { variant: action.variant })}
                >
                  <Link href={action.route(row.original)} className="flex items-center gap-1">
                    {IconComponent && <IconComponent className="h-4 w-4" />}
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
                className="flex items-center gap-1"
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
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
  pagination = { pageSize: 20 },
  cursorPagination,
  sorting: sortingConfig,
  onSearch,
  loading = false,
}: TableCompProps<T>) {
  const isCursorMode = Boolean(cursorPagination);
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
    pageSize: pagination.pageSize || 20,
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
    manualPagination: !!pagination.onPageChange || isCursorMode,
    manualSorting: !!sortingConfig?.onSortChange,
    pageCount: isCursorMode
      ? 1
      : pagination.totalCount
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

  const recordCount = isCursorMode
    ? filteredData.length
    : (pagination.totalCount ?? filteredData.length);

  return (
    <DataGrid
      table={table}
      recordCount={recordCount}
      isLoading={loading}
      tableLayout={modernTableLayout}
      tableClassNames={modernTableClassNames}
    >
      <Card className={modernTableCardClasses.card}>
        <CardHeader className={modernTableCardClasses.header}>
          <CardHeading>
            <div className="group relative my-1.5 w-full max-w-md">
              <Search className={cn(
                "pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 transition-colors",
                searchQuery
                  ? "text-sky-600 dark:text-sky-400"
                  : "text-muted-foreground group-focus-within:text-sky-600 dark:group-focus-within:text-sky-400"
              )} />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "h-9 w-full rounded-xl border-sky-100 bg-background/80 ps-10 pe-10 text-sm shadow-none",
                  "focus-visible:border-sky-300 focus-visible:ring-sky-500/15",
                  "dark:border-sky-900/50",
                  searchQuery && "border-sky-300 bg-sky-50/50 dark:bg-sky-950/30"
                )}
              />
              {searchQuery.length > 0 && (
                <Button
                  mode="icon"
                  variant="ghost"
                  className="absolute right-1.5 top-1/2 h-6 w-6 -translate-y-1/2 rounded-lg hover:bg-sky-100/80 dark:hover:bg-sky-900/40"
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
          {cursorPagination ? (
            <CursorDataGridPagination
              meta={cursorPagination.meta}
              onNext={cursorPagination.onNext}
              onPrev={cursorPagination.onPrev}
              canGoPrev={cursorPagination.canGoPrev}
              rowCount={filteredData.length}
            />
          ) : (
            <DataGridPagination />
          )}
        </CardFooter>
      </Card>
    </DataGrid>
  );
}
