'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CalendarDays, Loader2, TrendingUp, TrendingDown, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Container } from '@/components/common/container';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  getMerchantTurnoverReport,
  type MerchantTurnoverReportItem,
} from '@/lib/services/user/reports';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

export function ReportsContent() {
  const [data, setData] = useState<MerchantTurnoverReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Default to current month
    const today = new Date();
    return {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
  });
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch report data
  const fetchReport = async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      const response = await getMerchantTurnoverReport(startDate, endDate);
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data.data) {
            setData(data.data);
          } else {
            setData([]);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch report:', errorMessage);
          toast.error(errorMessage || 'Failed to load report data');
          setData([]);
        },
      });
    } catch (error) {
      console.error('Report fetch error:', error);
      toast.error('Unexpected error while loading report data');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const startDate = formatDateForAPI(dateRange.from);
      const endDate = formatDateForAPI(dateRange.to);
      fetchReport(startDate, endDate);
    }
  }, [dateRange]);

  const handleDateRangeApply = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      setDateRange(tempDateRange);
      setIsDatePickerOpen(false);
    } else {
      toast.error('Please select both start and end dates');
    }
  };

  const handleDateRangeReset = () => {
    const today = new Date();
    const defaultRange = {
      from: startOfMonth(today),
      to: endOfMonth(today),
    };
    setTempDateRange(defaultRange);
  };

  // Calculate totals
  const totals = useMemo(() => {
    return data.reduce(
      (acc, item) => ({
        successAmount: acc.successAmount + item.success_amount,
        successCount: acc.successCount + item.success_count,
        declinedAmount: acc.declinedAmount + item.declined_amount,
        declinedCount: acc.declinedCount + item.declined_count,
      }),
      {
        successAmount: 0,
        successCount: 0,
        declinedAmount: 0,
        declinedCount: 0,
      }
    );
  }, [data]);

  const totalTransactions = totals.successCount + totals.declinedCount;
  const overallSuccessPercentage = totalTransactions > 0
    ? ((totals.successCount / totalTransactions) * 100).toFixed(1)
    : '0.0';

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Date Range Filter</span>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
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
                  defaultMonth={tempDateRange?.from || new Date()}
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-end gap-2 border-t border-border p-3">
                  <Button variant="outline" size="sm" onClick={handleDateRangeReset}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleDateRangeApply}>
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Success Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(totals.successAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.successCount} successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Declined Amount</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(totals.declinedAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.declinedCount} declined transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totals.successCount} success + {totals.declinedCount} declined
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {overallSuccessPercentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on transaction count
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Merchant Turnover Report</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">No data available for the selected date range</p>
            </div>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Success Amount</TableHead>
                    <TableHead className="text-right">Success Count</TableHead>
                    <TableHead className="text-right">Declined Amount</TableHead>
                    <TableHead className="text-right">Declined Count</TableHead>
                    <TableHead className="text-right">Success %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDisplayDate(item.date)}
                      </TableCell>
                      <TableCell className="text-right text-success font-semibold">
                        {formatCurrency(item.success_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          {item.success_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-destructive font-semibold">
                        {formatCurrency(item.declined_amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          {item.declined_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge 
                          variant={item.success_percentage >= 90 ? 'success' : item.success_percentage >= 70 ? 'warning' : 'destructive'}
                        >
                          {item.success_percentage.toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

