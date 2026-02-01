'use client';

import { useState, useEffect, useMemo } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  CalendarDays,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getAdminLogs, type LogEntry, type LogType } from '@/lib/services/admin/logs';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LogsContentProps {
  logType: LogType;
  logTypeLabel: string;
}

export function LogsContent({ logType, logTypeLabel }: LogsContentProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch logs
  const fetchLogs = async (pageNum: number, pageLimit: number, startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      const response = await getAdminLogs({
        type: logType,
        page: pageNum,
        limit: pageLimit,
        startDate,
        endDate,
      });
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data.data) {
            setLogs(data.data);
            setMeta(data.meta);
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
  };

  // Fetch logs - only pass dates when user has applied a date filter
  useEffect(() => {
    const hasDateFilter = dateRange?.from && dateRange?.to;
    const startDate = hasDateFilter ? formatDateForAPI(dateRange.from) : undefined;
    const endDate = hasDateFilter ? formatDateForAPI(dateRange.to) : undefined;
    fetchLogs(page, limit, startDate, endDate);
  }, [page, limit, dateRange, logType]);

  const handleDateRangeApply = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      setDateRange(tempDateRange);
      setIsDatePickerOpen(false);
      setPage(1); // Reset to first page when date range changes
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  const handleDateRangeClear = () => {
    setTempDateRange(undefined);
    setDateRange(undefined);
    setIsDatePickerOpen(false);
    setPage(1);
  };

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
    return log.errorMessage || log.error || null;
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

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      API: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
      WEBHOOK: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
      STATUS_CHANGE: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      STATUS: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
      REFUND: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    };
    return (
      <Badge variant="outline" className={typeColors[type] || 'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'}>
        {type}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {meta && (
            <span>
              Showing {logs.length} of {meta.total} logs
            </span>
          )}
        </div>
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarDays className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={tempDateRange?.from ?? new Date()}
              selected={tempDateRange}
              onSelect={setTempDateRange}
              numberOfMonths={2}
            />
            <div className="flex items-center justify-end gap-2 border-t p-3">
              <Button variant="outline" size="sm" onClick={handleDateRangeClear}>
                Clear
              </Button>
              <Button size="sm" onClick={handleDateRangeApply}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
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
        <>
          <Card>
            <CardHeader>
              <CardTitle>{logTypeLabel}</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {logs.some(log => getErrorMessage(log)) && <TableHead>Error Message</TableHead>}
                      {logs.some(log => getTransactionId(log)) && <TableHead>Transaction ID</TableHead>}
                      {logs.some(log => getOrderId(log)) && <TableHead>Order ID</TableHead>}
                      {logs.some(log => log.type) && <TableHead>Type</TableHead>}
                      {logs.some(log => getStatus(log) !== null && getStatus(log) !== undefined) && <TableHead>Status</TableHead>}
                      {logs.some(log => getUserName(log)) && <TableHead>User</TableHead>}
                      {logs.some(log => log.adminId) && <TableHead>Admin ID</TableHead>}
                      {logs.some(log => log.rpId) && <TableHead>RP ID</TableHead>}
                      <TableHead>Created At</TableHead>
                      {logs.some(log => log.error || log.errorMessage) && <TableHead>Error</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => {
                      const hasErrorMessage = logs.some(l => getErrorMessage(l));
                      const hasTransactionId = logs.some(l => getTransactionId(l));
                      const hasOrderId = logs.some(l => getOrderId(l));
                      const hasType = logs.some(l => l.type);
                      const hasStatus = logs.some(l => getStatus(l) !== null && getStatus(l) !== undefined);
                      const hasUserName = logs.some(l => getUserName(l));
                      const hasAdminId = logs.some(l => l.adminId);
                      const hasRpId = logs.some(l => l.rpId);
                      const hasError = logs.some(l => l.error || l.errorMessage);
                      
                      return (
                        <TableRow key={log.id}>
                          {hasErrorMessage && (
                            <TableCell className="max-w-[300px]">
                              <div className="truncate text-sm" title={getErrorMessage(log) || ''}>
                                {getErrorMessage(log) || '—'}
                              </div>
                            </TableCell>
                          )}
                          {hasTransactionId && (
                            <TableCell className="font-mono text-xs">
                              {getTransactionId(log) || '—'}
                            </TableCell>
                          )}
                          {hasOrderId && (
                            <TableCell className="font-mono text-xs">
                              {getOrderId(log) || '—'}
                            </TableCell>
                          )}
                          {hasType && (
                            <TableCell>
                              {log.type ? getTypeBadge(log.type) : '—'}
                            </TableCell>
                          )}
                          {hasStatus && (
                            <TableCell>
                              {getStatus(log) !== null && getStatus(log) !== undefined 
                                ? getStatusBadge(getStatus(log)!) 
                                : '—'}
                            </TableCell>
                          )}
                          {hasUserName && (
                            <TableCell>
                              <span className="text-sm font-medium">{getUserName(log) || '—'}</span>
                            </TableCell>
                          )}
                          {hasAdminId && (
                            <TableCell className="text-sm">
                              {log.adminId ? String(log.adminId) : '—'}
                            </TableCell>
                          )}
                          {hasRpId && (
                            <TableCell className="text-sm">
                              {log.rpId ? String(log.rpId) : '—'}
                            </TableCell>
                          )}
                          <TableCell className="text-sm">
                            {formatDate(getCreatedAt(log))}
                          </TableCell>
                          {hasError && (
                            <TableCell>
                              {(log.error || log.errorMessage) ? (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Error
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(log)}
                              className="h-8"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {meta.page} of {meta.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
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
                {selectedLog.type && (
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
                {selectedLog.event && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Event</label>
                    <div className="mt-1">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-mono text-xs">
                        {selectedLog.event}
                      </Badge>
                    </div>
                  </div>
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
              {selectedLog.response && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Response</label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.response, null, 2)}
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

