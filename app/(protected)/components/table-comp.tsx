'use client';

import { useMemo, useState } from 'react';
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { User } from '@/lib/services/users-api';

// Dummy data matching User interface
const dummyUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
    parentId: null,
    emailVerifiedAt: '2025-12-03T07:34:19.190Z',
    isBlocked: false,
    isDeleted: false,
    uniqueId: '799b9195-4b21-4a1d-9c5d-18fd584ab9b2',
    isTwoFaEnabled: false,
    provider: 'email',
    profileImage: null,
    avatarUrl: null,
    isProfileCompleted: true,
    isKycCompleted: null,
    profileStep: 0,
    entityType: null,
    createdAt: '2025-12-03T02:04:19.166Z',
    updatedAt: '2025-12-03T02:04:19.166Z',
  },
  {
    id: '2',
    email: 'affiliate@example.com',
    name: 'Affiliate User',
    role: 'affiliate',
    parentId: null,
    emailVerifiedAt: '2025-12-03T07:34:19.176Z',
    isBlocked: false,
    isDeleted: false,
    uniqueId: '86c650a5-602a-4ab1-918b-21b634bade76',
    isTwoFaEnabled: false,
    provider: 'email',
    profileImage: null,
    avatarUrl: null,
    isProfileCompleted: true,
    isKycCompleted: null,
    profileStep: 0,
    entityType: null,
    createdAt: '2025-12-03T02:04:19.176Z',
    updatedAt: '2025-12-03T02:04:19.176Z',
  },
];

export function TableComp() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery) return dummyUsers;

    const searchLower = searchQuery.toLowerCase();
    return dummyUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (user.isBlocked ? 'blocked' : 'active').includes(searchLower),
    );
  }, [searchQuery]);

  // Define columns
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'select',
        header: () => <DataGridTableRowSelectAll />,
        cell: ({ row }) => <DataGridTableRowSelect row={row} />,
        enableSorting: false,
        enableHiding: false,
        size: 50,
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
        accessorKey: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => {
          return <div className="text-muted-foreground">{row.original.email}</div>;
        },
      },
      {
        accessorKey: 'role',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Role" />
        ),
        cell: ({ row }) => {
          const role = row.original.role;
          return (
            <Badge variant="secondary" className="capitalize">
              {role}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'isBlocked',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const isBlocked = row.original.isBlocked;
          return (
            <Badge variant={isBlocked ? 'destructive' : 'success'}>
              {isBlocked ? 'Blocked' : 'Active'}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Created At" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt);
          return (
            <div className="text-sm text-muted-foreground">
              {date.toLocaleDateString()}
            </div>
          );
        },
      },
    ],
    []
  );

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getRowId: (row) => row.id,
    state: {
      sorting,
      pagination,
      rowSelection,
    },
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData.length}
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
                  placeholder="Search users..."
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
