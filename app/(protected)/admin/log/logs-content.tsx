'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import {
  Loader2,
  FileText,
  AlertCircle,
  Eye,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardHeading, CardTable, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DateRangeFilter } from '@/components/ui/date-range-filter';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { CursorDataGridPagination } from '@/components/ui/cursor-data-grid-pagination';
import { useCursorPagination } from '@/lib/hooks/use-cursor-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  getAdminLogs,
  type LogEntry,
  type LogListMeta,
  type LogType,
} from '@/lib/services/admin/logs';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { modernTableLayout, modernTableClassNames, modernTableCardClasses } from '@/app/(protected)/components/table-comp';

/** API log fields may be strings or structured objects (e.g. cron/job errors as `{ name, message, stack }`). */
function stringifyLogField(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    const o = value as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) {
      const name = typeof o.name === 'string' ? o.name : '';
      return name ? `${name}: ${o.message}` : o.message;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

interface LogsContentProps {
  logType: LogType;
  logTypeLabel: string;
}

export function LogsContent({ logType, logTypeLabel }: LogsContentProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [meta, setMeta] = useState<LogListMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const { requestCursor, reset: resetCursor, goNext, goPrev, canGoPrev } =
    useCursorPagination();
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  // Advanced filter: ID (transaction_id) – provider, transaction, and webhook logs
  const [transactionIdFilter, setTransactionIdFilter] = useState('');
  const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);
  const supportsTransactionIdFilter =
    logType === 'provider_logs' || logType === 'txn_logs' || logType === 'webhook_logs';

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const fetchLogs = useCallback(
    async (
      cursor: string | undefined,
      pageLimit: number,
      startDate?: string,
      endDate?: string,
      transactionId?: string,
    ) => {
      setLoading(true);
      try {
        const response = await getAdminLogs({
          type: logType,
          limit: pageLimit,
          ...(cursor ? { cursor } : {}),
          startDate,
          endDate,
          ...(transactionId?.trim() ? { transaction_id: transactionId.trim() } : {}),
          ...(logType === 'webhook_logs' || logType === 'txn_logs'
            ? { payment_mode: 'production' }
            : {}),
        });
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data?.success && Array.isArray(data.data)) {
              setLogs(data.data);
              setMeta(data.meta ?? null);
            } else {
              setLogs([]);
              setMeta(null);
            }
          },
          onError: (errorMessage) => {
            console.error('Failed to fetch logs:', errorMessage);
            toast.error(errorMessage || 'Failed to load logs');
            setLogs([]);
            setMeta(null);
          },
        });
      } catch (error) {
        console.error('Logs fetch error:', error);
        toast.error('Unexpected error while loading logs');
        setLogs([]);
        setMeta(null);
      } finally {
        setLoading(false);
      }
    },
    [logType],
  );

  useEffect(() => {
    const hasDateFilter = dateRange?.from && dateRange?.to;
    const startDate = hasDateFilter ? formatDateForAPI(dateRange.from) : undefined;
    const endDate = hasDateFilter ? formatDateForAPI(dateRange.to) : undefined;
    const txnId =
      supportsTransactionIdFilter && transactionIdFilter.trim()
        ? transactionIdFilter.trim()
        : undefined;
    fetchLogs(requestCursor, limit, startDate, endDate, txnId);
  }, [
    requestCursor,
    limit,
    dateRange,
    logType,
    transactionIdFilter,
    supportsTransactionIdFilter,
    fetchLogs,
  ]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    resetCursor();
  };

  const handleClearTransactionIdFilter = () => {
    setTransactionIdFilter('');
    resetCursor();
  };

  const handleCursorNext = useCallback(() => {
    if (meta?.nextCursor) goNext(meta.nextCursor);
  }, [meta?.nextCursor, goNext]);

  const handleCursorPrev = useCallback(() => {
    goPrev();
  }, [goPrev]);

  const handleViewDetails = (log: LogEntry) => {
    setSelectedLog(log);
    setDetailsDialogOpen(true);
  };

  // Helper to get normalized field values
  const getTransactionId = (log: LogEntry): string | null => {
    return log.transactionId || log.transaction_id || null;
  };

  const getOrderId = (log: LogEntry): string | null => {
    return log.orderId || log.order_id || null;
  };

  const getUserId = (log: LogEntry): string | null => {
    return log.userId || log.user_id || (log.user?.id) || null;
  };

  const getUserName = (log: LogEntry): string | null => {
    return log.userName || log.user_name || (log.user?.name) || null;
  };

  const getAdminName = (log: LogEntry): string | null => {
    return (log.admin?.name) || null;
  };

  const getCreatedAt = (log: LogEntry): string | null => {
    return log.createdAt || log.created_at || null;
  };

  const getUpdatedAt = (log: LogEntry): string | null => {
    return log.updatedAt || log.updated_at || null;
  };

  const getStatus = (log: LogEntry): number | null => {
    return log.status !== undefined ? log.status : null;
  };

  const getErrorMessage = (log: LogEntry): string | null => {
    if (log.errorMessage != null) {
      const s = stringifyLogField(log.errorMessage);
      if (s) return s;
    }
    if (log.error != null) {
      return stringifyLogField(log.error);
    }
    return null;
  };

  const getErrorContext = (log: LogEntry): Record<string, any> | null => {
    if (!log.errorContext) return null;
    try {
      return typeof log.errorContext === 'string' 
        ? JSON.parse(log.errorContext) 
        : log.errorContext;
    } catch {
      return null;
    }
  };

  // Determine log format type
  const isErrorLogFormat = (log: LogEntry): boolean => {
    return !!(log.errorMessage || log.errorContext);
  };

  const isTransactionLogFormat = (log: LogEntry): boolean => {
    return !!(log.transactionId || log.transaction_id || log.payload || log.response);
  };

  // Safe date formatter that handles invalid dates
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, 'MMM dd, yyyy HH:mm:ss');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatDateLong = (dateString: string | null | undefined): string => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return format(date, 'PPpp');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">Pending</Badge>;
      case 1:
        return <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">Success</Badge>;
      case 2:
        return <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">Failed</Badge>;
      case 3:
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">Blocked</Badge>;
      case 4:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300">Abandoned</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: unknown) => {
    const label = stringifyLogField(type);
    if (!label) return <span className="text-muted-foreground">—</span>;
    const typeColors: Record<string, string> = {
      API: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      WEBHOOK: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      STATUS_CHANGE: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      STATUS: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      REFUND: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    };
    return (
      <Badge variant="outline" className={typeColors[label] || 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'}>
        <span className="truncate max-w-[200px] inline-block align-bottom" title={label}>
          {label}
        </span>
      </Badge>
    );
  };

  const getEventBadge = (event: string | null | undefined) => {
    const text = event == null ? null : stringifyLogField(event);
    if (!text) return <span className="text-muted-foreground">—</span>;
    return (
      <Badge variant="outline" className="bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300 font-mono text-xs inline-flex max-w-full min-w-0" title={text}>
        <span className="truncate">{text}</span>
      </Badge>
    );
  };

  // Admin audit logs: Event, Admin, Created At, Error Message, View (no Transaction ID, Type, Status).
  // App error logs: Error Message, Created At, View (no Transaction ID, Type, Status).
  // Provider logs: Transaction ID, Provider, Action, Method, Response Status, Created At, Error Message, View.
  // Other log types: Transaction ID, Type, Status, Created At, Error Message, View.
  const isAdminAuditLogs = logType === 'admin_audit_logs';
  const isAppErrorLogs = logType === 'app_error_logs';
  const isProviderLogs = logType === 'provider_logs';
  const showTxnTypeStatus = !isAdminAuditLogs && !isAppErrorLogs && !isProviderLogs;

  const columns = useMemo<ColumnDef<LogEntry>[]>(
    () => {
      const cols: ColumnDef<LogEntry>[] = [];

      if (showTxnTypeStatus || isProviderLogs) {
        cols.push({
          id: 'transactionId',
          accessorFn: (row) => getTransactionId(row),
          header: ({ column }) => <DataGridColumnHeader column={column} title="Transaction ID" />,
          cell: ({ row }) => (
            <div className="font-mono text-xs min-w-[140px]">
              {getTransactionId(row.original) || '—'}
            </div>
          ),
          enableSorting: false,
          size: 180,
        });
      }

      if (showTxnTypeStatus) {
        cols.push({
          id: 'type',
          accessorKey: 'type',
          header: ({ column }) => <DataGridColumnHeader column={column} title="Type" />,
          cell: ({ row }) =>
            row.original.type != null && row.original.type !== ''
              ? getTypeBadge(row.original.type)
              : <span className="text-muted-foreground">—</span>,
          enableSorting: false,
          size: 140,
        });
      }

      if (showTxnTypeStatus) {
        cols.push({
          id: 'status',
          accessorFn: (row) => getStatus(row),
          header: ({ column }) => <DataGridColumnHeader column={column} title="Status" />,
          cell: ({ row }) => {
            const s = getStatus(row.original);
            return s !== null && s !== undefined ? getStatusBadge(s) : <span className="text-muted-foreground">—</span>;
          },
          enableSorting: false,
          size: 110,
        });
      }

      if (isProviderLogs) {
        cols.push({
          id: 'provider',
          accessorKey: 'provider',
          header: ({ column }) => <DataGridColumnHeader column={column} title="Provider" />,
          cell: ({ row }) => (
            <span className="text-sm font-medium">{row.original.provider ?? '—'}</span>
          ),
          enableSorting: false,
          size: 130,
        });
        cols.push({
          id: 'action',
          accessorKey: 'action',
          header: ({ column }) => <DataGridColumnHeader column={column} title="Action" />,
          cell: ({ row }) => (
            <Badge variant="outline" className="font-mono text-xs">
              {row.original.action ?? '—'}
            </Badge>
          ),
          enableSorting: false,
          size: 100,
        });
        cols.push({
          id: 'method',
          accessorKey: 'method',
          header: ({ column }) => <DataGridColumnHeader column={column} title="Method" />,
          cell: ({ row }) => (
            <Badge variant="secondary" className="font-mono text-xs">
              {row.original.method ?? '—'}
            </Badge>
          ),
          enableSorting: false,
          size: 80,
        });
        cols.push({
          id: 'responseStatus',
          accessorKey: 'responseStatus',
          header: ({ column }) => <DataGridColumnHeader column={column} title="Response Status" />,
          cell: ({ row }) => {
            const status = row.original.responseStatus;
            const isOk = status != null && status >= 200 && status < 300;
            return (
              <Badge variant="outline" className={isOk ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'}>
                {status != null ? String(status) : '—'}
              </Badge>
            );
          },
          enableSorting: false,
          size: 120,
        });
      }

      if (isAdminAuditLogs) {
        cols.push({
          id: 'event',
          accessorKey: 'event',
          header: ({ column }) => <DataGridColumnHeader column={column} title="Event" />,
          cell: ({ row }) => (
            <div className="min-w-0 max-w-[280px] overflow-hidden" title={row.original.event ?? ''}>
              {getEventBadge(row.original.event)}
            </div>
          ),
          enableSorting: false,
          size: 280,
        });
        cols.push({
          id: 'admin',
          accessorFn: (row) => getAdminName(row),
          header: ({ column }) => <DataGridColumnHeader column={column} title="Admin" />,
          cell: ({ row }) => {
            const label = getAdminName(row.original) || row.original.admin?.email || '—';
            return (
              <div className="min-w-0 max-w-[140px] overflow-hidden truncate text-sm" title={typeof label === 'string' ? label : ''}>
                {label}
              </div>
            );
          },
          enableSorting: false,
          size: 140,
        });
      }

      cols.push({
        id: 'createdAt',
        accessorFn: (row) => getCreatedAt(row),
        header: ({ column }) => <DataGridColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => <span className="text-sm whitespace-nowrap">{formatDate(getCreatedAt(row.original))}</span>,
        enableSorting: false,
        size: 180,
      });
      cols.push({
        id: 'errorMessage',
        accessorFn: (row) => getErrorMessage(row),
        header: ({ column }) => <DataGridColumnHeader column={column} title="Error Message" />,
        cell: ({ row }) => (
          <div className="max-w-[280px] truncate text-sm" title={getErrorMessage(row.original) || ''}>
            {getErrorMessage(row.original) || '—'}
          </div>
        ),
        enableSorting: false,
        size: 260,
      });
      cols.push({
        id: 'actions',
        header: ({ column }) => <DataGridColumnHeader column={column} title="View" />,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row.original)}
            className="h-8"
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        ),
        enableSorting: false,
        size: 90,
      });

      return cols;
    },
    [isAdminAuditLogs, isAppErrorLogs, isProviderLogs, showTxnTypeStatus]
  );

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: 1,
    getRowId: (row) => String(row.id),
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function' ? updater(pagination) : updater;
      if (next.pageSize !== pagination.pageSize) {
        setLimit(next.pageSize);
        setPagination({ pageIndex: 0, pageSize: next.pageSize });
        resetCursor();
      } else {
        setPagination(next);
      }
    },
    state: {
      pagination,
    },
  });

  return (
    <div className="space-y-6">
      {/* Date range, advanced filter (transaction_id), and count */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="text-sm text-muted-foreground">
            {!loading && meta && (
              <span>
                {logs.length} log{logs.length === 1 ? '' : 's'} on this page
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {supportsTransactionIdFilter && (
              <Collapsible open={advancedFilterOpen} onOpenChange={setAdvancedFilterOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Advanced filter
                    {transactionIdFilter.trim() ? (
                      <Badge variant="secondary" className="ml-1 text-xs">1</Badge>
                    ) : null}
                    {advancedFilterOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 p-4 rounded-lg border bg-muted/30 flex flex-wrap items-end gap-3">
                    <div className="flex flex-col gap-1.5 min-w-[200px]">
                      <label htmlFor="filter-transaction-id" className="text-sm font-medium text-muted-foreground">
                        ID (transaction_id)
                      </label>
                      <Input
                        id="filter-transaction-id"
                        placeholder="e.g. ejndejde"
                        value={transactionIdFilter}
                        onChange={(e) => {
                          setTransactionIdFilter(e.target.value);
                          resetCursor();
                        }}
                        className="font-mono h-8"
                        variant="sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearTransactionIdFilter}
                      disabled={!transactionIdFilter.trim()}
                    >
                      Clear
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
            <DateRangeFilter
              value={dateRange}
              onChange={handleDateRangeChange}
              placeholder="Pick a date range"
              numberOfMonths={2}
              triggerClassName="w-[280px]"
              size="sm"
            />
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No logs found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {dateRange
                ? `No ${logTypeLabel.toLowerCase()} found for the selected date range`
                : `No ${logTypeLabel.toLowerCase()} found`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataGrid
          table={table}
          recordCount={logs.length}
          isLoading={false}
          tableLayout={modernTableLayout}
          tableClassNames={modernTableClassNames}
        >
          <Card className={modernTableCardClasses.card}>
            <CardHeader className={modernTableCardClasses.header}>
              <CardHeading>
                <CardTitle className="text-lg font-semibold">{logTypeLabel}</CardTitle>
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
                rowCount={logs.length}
              />
            </CardFooter>
          </Card>
        </DataGrid>
      )}

      {/* Log Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Details</DialogTitle>
            <DialogDescription>
              Detailed information for log entry {selectedLog?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Log ID</label>
                  <p className="font-mono text-sm">{selectedLog.id}</p>
                </div>
                {getTransactionId(selectedLog) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
                    <p className="font-mono text-sm">{getTransactionId(selectedLog)}</p>
                  </div>
                )}
                {getOrderId(selectedLog) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Order ID</label>
                    <p className="font-mono text-sm">{getOrderId(selectedLog)}</p>
                  </div>
                )}
                {selectedLog.type != null && selectedLog.type !== '' && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Type</label>
                    <div className="mt-1">{getTypeBadge(selectedLog.type)}</div>
                  </div>
                )}
                {getStatus(selectedLog) !== null && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <div className="mt-1">{getStatusBadge(getStatus(selectedLog)!)}</div>
                  </div>
                )}
                {getAdminName(selectedLog) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Admin</label>
                    <p className="text-sm">
                      {getAdminName(selectedLog)}
                      {selectedLog.admin?.email && (
                        <span className="text-muted-foreground ml-2">({selectedLog.admin.email})</span>
                      )}
                      {selectedLog.adminId && (
                        <span className="text-muted-foreground ml-2">ID: {selectedLog.adminId}</span>
                      )}
                    </p>
                  </div>
                )}
                {getUserName(selectedLog) && !getAdminName(selectedLog) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User</label>
                    <p className="text-sm">
                      {getUserName(selectedLog)}
                      {getUserId(selectedLog) && (
                        <span className="text-muted-foreground ml-2">(ID: {getUserId(selectedLog)})</span>
                      )}
                    </p>
                  </div>
                )}
                {selectedLog.event != null && selectedLog.event !== '' && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Event</label>
                    <div className="mt-1">{getEventBadge(selectedLog.event)}</div>
                  </div>
                )}
                {/* Provider log fields */}
                {selectedLog.provider && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Provider</label>
                      <p className="text-sm font-medium">{selectedLog.provider}</p>
                    </div>
                    {selectedLog.action && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Action</label>
                        <p className="text-sm font-mono">{selectedLog.action}</p>
                      </div>
                    )}
                    {selectedLog.method && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Method</label>
                        <p className="text-sm font-mono">{selectedLog.method}</p>
                      </div>
                    )}
                    {selectedLog.responseStatus != null && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Response Status</label>
                        <p className="text-sm font-mono">{selectedLog.responseStatus}</p>
                      </div>
                    )}
                    {selectedLog.endpoint && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Endpoint</label>
                        <p className="text-sm font-mono break-all">{selectedLog.endpoint}</p>
                      </div>
                    )}
                    {selectedLog.providerReference && (
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Provider Reference</label>
                        <p className="text-sm font-mono break-all">{selectedLog.providerReference}</p>
                      </div>
                    )}
                  </>
                )}
                {selectedLog.details && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Details</label>
                    <div className="mt-1 p-3 bg-muted rounded-md">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created At</label>
                  <p className="text-sm">{formatDateLong(getCreatedAt(selectedLog))}</p>
                </div>
                {getUpdatedAt(selectedLog) && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <p className="text-sm">{formatDateLong(getUpdatedAt(selectedLog))}</p>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {getErrorMessage(selectedLog) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Error Message</label>
                  <div className="mt-1 p-3 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-300">{getErrorMessage(selectedLog)}</p>
                  </div>
                </div>
              )}

              {/* Error Context */}
              {getErrorContext(selectedLog) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Error Context</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(getErrorContext(selectedLog), null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Admin ID / RP ID */}
              {(selectedLog.adminId || selectedLog.rpId) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedLog.adminId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Admin ID</label>
                      <p className="text-sm font-mono">{selectedLog.adminId}</p>
                    </div>
                  )}
                  {selectedLog.rpId && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">RP ID</label>
                      <p className="text-sm font-mono">{selectedLog.rpId}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Additional Fields - Show any other fields that exist */}
              {Object.keys(selectedLog).some(key => 
                !['id', 'transactionId', 'transaction_id', 'orderId', 'order_id', 'type', 'status', 
                  'payload', 'response', 'webhook', 'error', 'createdAt', 'created_at', 
                  'updatedAt', 'updated_at', 'userId', 'user_id', 'userName', 'user_name'].includes(key)
              ) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Additional Information</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(selectedLog).filter(([key]) =>
                            !['id', 'transactionId', 'transaction_id', 'orderId', 'order_id', 'type', 'status',
                              'payload', 'response', 'webhook', 'error', 'createdAt', 'created_at',
                              'updatedAt', 'updated_at', 'userId', 'user_id', 'userName', 'user_name'].includes(key)
                          )
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {/* Request (e.g. provider logs) */}
              {selectedLog.request != null && typeof selectedLog.request === 'object' && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Request</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.request, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Payload */}
              {selectedLog.payload && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payload</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Response */}
              {selectedLog.response != null && (typeof selectedLog.response === 'object' || typeof selectedLog.response === 'string') && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Response</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {typeof selectedLog.response === 'string'
                        ? selectedLog.response
                        : JSON.stringify(selectedLog.response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Webhook */}
              {selectedLog.webhook && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Webhook</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.webhook, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

