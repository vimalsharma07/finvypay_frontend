'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getSettlements,
  updateSettlement,
  generateSettlement,
  Settlement,
  UpdateSettlementPayload,
  GenerateSettlementPayload,
} from '@/lib/services/admin/settlements';
import { getMerchants } from '@/lib/services/admin/users';
import { EditSettlementDialog } from './components/edit-settlement-dialog';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardTable } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { MoreHorizontal, Eye, Download, ExternalLink, Pencil } from 'lucide-react';
import Link from 'next/link';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

const DATE_FMT = 'yyyy-MM-dd';
const DATE_TIME_FMT = 'yyyy-MM-dd HH:mm';

export default function AdminSettlementsPage() {
  const [data, setData] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settlementToEdit, setSettlementToEdit] = useState<Settlement | null>(null);
  const [updating, setUpdating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Generate settlement form
  const [merchantOptions, setMerchantOptions] = useState<{ label: string; value: string }[]>([]);
  const [generateUserId, setGenerateUserId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [disputesStartDate, setDisputesStartDate] = useState('');
  const [disputesEndDate, setDisputesEndDate] = useState('');
  const [generateType, setGenerateType] = useState<string>('NORMAL');
  const [generating, setGenerating] = useState(false);

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'createdAt', desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const formatCurrency = (amount: string | null | undefined) => {
    if (!amount) return '—';
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatNumber = (num: number | null | undefined) => {
    if (num === null || num === undefined) return '—';
    return num.toLocaleString();
  };

  const paidStatusVariant = (isPaid: boolean) => {
    return isPaid ? 'success' : 'warning';
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const page = pagination.pageIndex + 1;
      const limit = pagination.pageSize;
      const sortBy = sorting[0]?.id || 'createdAt';
      const sortOrder = sorting[0]?.desc ? 'DESC' : 'ASC';

      const response = await getSettlements({
        page,
        limit,
        sortBy,
        sortOrder,
      });
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setData(res.data);
            setMeta(res.meta);
          } else {
            toast.error('Invalid response structure while loading settlements');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load settlements');
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred while fetching settlements');
      console.error('Settlements fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMerchants({ page: 1, limit: 1000, role: 'merchant' });
        if (res.data?.data && Array.isArray(res.data.data)) {
          setMerchantOptions(
            res.data.data.map((u) => ({
              label: u.name || u.email || u.id,
              value: String(u.id),
            }))
          );
        }
      } catch (e) {
        console.error('Failed to load merchants', e);
      }
    };
    load();
  }, []);

  const handleGenerateReport = async () => {
    if (!generateUserId?.trim()) {
      toast.error('Please select a merchant');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    if (!disputesStartDate || !disputesEndDate) {
      toast.error('Please select chargebacks start and end dates');
      return;
    }
    setGenerating(true);
    try {
      const payload: GenerateSettlementPayload = {
        userId: Number(generateUserId),
        startDate,
        endDate,
        disputesStartDate,
        disputesEndDate,
        type: generateType as 'NORMAL' | 'MANUAL',
        remarks: 'T+5 settlement',
      };
      const response = await generateSettlement(payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Settlement generated successfully');
          fetchData();
        },
        onError: (message) => {
          toast.error(message || 'Failed to generate settlement');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred while generating settlement');
      console.error('Generate settlement error:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPdf = (pdfUrl: string | null) => {
    if (!pdfUrl) {
      toast.error('PDF not available');
      return;
    }
    window.open(pdfUrl, '_blank');
  };

  const handleEditSettlement = (settlement: Settlement) => {
    setSettlementToEdit(settlement);
    setEditDialogOpen(true);
  };

  const handleUpdateSettlement = async (id: string, payload: UpdateSettlementPayload) => {
    setUpdating(true);
    try {
      const response = await updateSettlement(id, payload);
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success('Settlement updated successfully');
          setEditDialogOpen(false);
          setSettlementToEdit(null);
          fetchData();
        },
        onError: (message) => {
          toast.error(message || 'Failed to update settlement');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred while updating settlement');
      console.error('Update settlement error:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleTogglePaid = async (id: string, isPaid: boolean) => {
    setUpdatingId(id);
    try {
      const response = await updateSettlement(id, { isPaid });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(isPaid ? 'Marked as paid' : 'Marked as pending');
          fetchData();
        },
        onError: (message) => {
          toast.error(message || 'Failed to update settlement');
        },
      });
    } catch (error) {
      toast.error('Failed to update settlement');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleDisplayToMerchant = async (id: string, isDisplayToMerchant: boolean) => {
    setUpdatingId(id);
    try {
      const response = await updateSettlement(id, { isDisplayToMerchant });
      handleApiResponse(response, {
        onSuccess: () => {
          toast.success(isDisplayToMerchant ? 'Visible to merchant' : 'Hidden from merchant');
          fetchData();
        },
        onError: (message) => {
          toast.error(message || 'Failed to update settlement');
        },
      });
    } catch (error) {
      toast.error('Failed to update settlement');
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = useMemo<ColumnDef<Settlement>[]>(
    () => [
      {
        accessorKey: 'invoiceNumber',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Invoice Number" />
        ),
        cell: ({ row }) => row.original.invoiceNumber || '—',
      },
      {
        accessorKey: 'userName',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="User" />
        ),
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.userName || '—'}</span>
            <span className="text-xs text-muted-foreground">
              {row.original.userEmail || '—'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'settlementDate',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Settlement Date" />
        ),
        cell: ({ row }) =>
          row.original.settlementDate
            ? format(new Date(row.original.settlementDate), DATE_FMT)
            : '—',
      },
      {
        accessorKey: 'grossAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Gross Amount" />
        ),
        cell: ({ row }) => formatCurrency(row.original.grossAmountUsd),
      },
      {
        accessorKey: 'totalDeductionsUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Deductions" />
        ),
        cell: ({ row }) => formatCurrency(row.original.totalDeductionsUsd),
      },
      {
        accessorKey: 'netAmountUsd',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Net Amount" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold">
            {formatCurrency(row.original.netAmountUsd)}
          </span>
        ),
      },
      {
        accessorKey: 'paidAmount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Paid Amount" />
        ),
        cell: ({ row }) => formatCurrency(row.original.paidAmount),
      },
      {
        accessorKey: 'isPaid',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Paid" />
        ),
        cell: ({ row }) => {
          const id = row.original.id;
          const isPaid = row.original.isPaid ?? false;
          const isUpdating = updatingId === id;
          return (
            <Switch
              checked={isPaid}
              onCheckedChange={(checked) => handleTogglePaid(id, !!checked)}
              disabled={isUpdating}
            />
          );
        },
      },
      {
        accessorKey: 'isDisplayToMerchant',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Show Merchant" />
        ),
        cell: ({ row }) => {
          const id = row.original.id;
          const isDisplayToMerchant = row.original.isDisplayToMerchant ?? false;
          const isUpdating = updatingId === id;
          return (
            <Switch
              checked={isDisplayToMerchant}
              onCheckedChange={(checked) => handleToggleDisplayToMerchant(id, !!checked)}
              disabled={isUpdating}
            />
          );
        },
      },
      {
        accessorKey: 'type',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Type" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="px-2.5 py-1 text-[11px] font-semibold">
            {row.original.type || '—'}
          </Badge>
        ),
      },
      {
        accessorKey: 'totalSuccessCount',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Success" />
        ),
        cell: ({ row }) => formatNumber(row.original.totalSuccessCount),
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Created" />
        ),
        cell: ({ row }) =>
          row.original.createdAt
            ? format(new Date(row.original.createdAt), DATE_TIME_FMT)
            : '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost" className="px-2">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href={`/admin/settlement/${row.original.id}`} className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleEditSettlement(row.original)}
                className="flex items-center gap-1"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {row.original.pdfUrl && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleViewPdf(row.original.pdfUrl)}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleViewPdf(row.original.pdfUrl)}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View PDF
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [updatingId]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: meta ? meta.totalPages : -1,
  });

  return (
    <div className="overflow-x-hidden">
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="All Settlements"
            description="View and manage all settlement records with payment status, amounts, and transaction details"
            icon={FileText}
          />
          <ToolbarActions>
            {/* reserved for filters or bulk actions */}
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Settlements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="generate-merchant">
                  Select Merchant <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={generateUserId}
                  onValueChange={setGenerateUserId}
                  disabled={generating}
                >
                  <SelectTrigger id="generate-merchant">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {merchantOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="start-date">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={generating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={generating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disputes-start">
                  Chargebacks Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="disputes-start"
                  type="date"
                  value={disputesStartDate}
                  onChange={(e) => setDisputesStartDate(e.target.value)}
                  disabled={generating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disputes-end">
                  Chargebacks End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="disputes-end"
                  type="date"
                  value={disputesEndDate}
                  onChange={(e) => setDisputesEndDate(e.target.value)}
                  disabled={generating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="generate-type">Settlement Type</Label>
                <Select
                  value={generateType}
                  onValueChange={setGenerateType}
                  disabled={generating}
                >
                  <SelectTrigger id="generate-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">NORMAL (uses acquirer rates)</SelectItem>
                    <SelectItem value="MANUAL">MANUAL (uses merchant rates)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleGenerateReport}
                disabled={generating}
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>

      <Container>
        <DataGrid
          table={table}
          recordCount={meta?.total ?? data.length}
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
            <CardFooter className={modernTableCardClasses.footer}>
              <DataGridPagination />
            </CardFooter>
          </Card>
        </DataGrid>
      </Container>

      <EditSettlementDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        settlement={settlementToEdit}
        onSubmit={handleUpdateSettlement}
        isSubmitting={updating}
      />
    </div>
  );
}

