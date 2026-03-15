'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Users, Eye, CheckCircle2 } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getAffiliatePendingApplications,
  approveAffiliateApplication,
  type AffiliateApplication,
} from '@/lib/services/admin/applications';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Badge } from '@/components/ui/badge';
import { Card, CardTable } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  modernTableLayout,
  modernTableClassNames,
  modernTableCardClasses,
} from '@/app/(protected)/components/table-comp';

const DATE_FMT = 'yyyy-MM-dd HH:mm';

const statusVariant = (status: string | null) => {
  if (!status) return 'outline';
  const s = status.toLowerCase();
  if (s === 'approved') return 'success';
  if (s === 'pending') return 'warning';
  if (s === 'rejected') return 'destructive';
  return 'outline';
};

export default function AdminAffiliateApplicationsPage() {
  const [data, setData] = useState<AffiliateApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAffiliatePendingApplications();
      handleApiResponse(response, {
        onSuccess: (body) => {
          if (body?.success && Array.isArray(body.data)) {
            setData(body.data);
          } else {
            setData([]);
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load affiliate applications');
          setData([]);
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleApprove = useCallback(
    async (id: string) => {
      setActioningId(id);
      try {
        const response = await approveAffiliateApplication(id);
        handleApiResponse(response, {
          onSuccess: (res) => {
            if (res?.success) {
              toast.success('Affiliate application approved');
              fetchData();
            } else {
              toast.error(res?.message || 'Failed to approve');
            }
          },
          onError: (message) => toast.error(message || 'Failed to approve'),
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
      } finally {
        setActioningId(null);
      }
    },
    [fetchData]
  );

  const columns = useMemo<ColumnDef<AffiliateApplication>[]>(
    () => [
      {
        accessorKey: 'rpName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => row.original.rpName || row.original.user?.name || '—',
      },
      {
        accessorKey: 'email',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Email" />
        ),
        cell: ({ row }) => row.original.email || '—',
      },
      {
        accessorKey: 'phoneNumber',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Phone" />
        ),
        cell: ({ row }) => {
          const code = row.original.phoneCountryCode || '';
          const num = row.original.phoneNumber || '';
          return code || num ? `${code} ${num}`.trim() : '—';
        },
      },
      {
        accessorKey: 'country',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Country" />
        ),
        cell: ({ row }) => row.original.country || '—',
      },
      {
        accessorKey: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => (
          <Badge
            variant={statusVariant(row.original.status)}
            className="px-2.5 py-1 text-[11px] font-semibold uppercase"
          >
            {row.original.status || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) =>
          row.original.createdAt
            ? format(new Date(row.original.createdAt), DATE_FMT)
            : '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const app = row.original;
          const isActioning = actioningId === app.id;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="px-2">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/admin/applications/affiliate/${app.id}`}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </Link>
                </DropdownMenuItem>
                {app.status === 'pending' && (
                  <DropdownMenuItem
                    disabled={isActioning}
                    onClick={() => handleApprove(app.id)}
                    className="flex items-center gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span
                      className={cn(
                        'text-success',
                        isActioning && 'opacity-70'
                      )}
                    >
                      {isActioning ? 'Approving...' : 'Approve'}
                    </span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [actioningId, handleApprove]
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-x-hidden">
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Affiliate Applications"
            description="Review and approve pending affiliate (referral partner) onboarding applications"
            icon={Users}
          />
        </Toolbar>
      </Container>
      <Container>
        <DataGrid
          table={table}
          recordCount={data.length}
          isLoading={loading}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
          <Card className={modernTableCardClasses.card}>
            <CardTable className={modernTableCardClasses.table}>
              <ScrollArea className="w-full">
                <DataGridTable />
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardTable>
          </Card>
        </DataGrid>
      </Container>
    </div>
  );
}
