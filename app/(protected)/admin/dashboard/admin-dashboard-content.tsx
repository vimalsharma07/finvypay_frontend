'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import {
  Users,
  UserCheck,
  UserCog,
  TrendingUp,
  TrendingDown,
  XCircle,
  RefreshCw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DynamicApexChart } from '@/components/charts/dynamic-apex-chart';
import { getAdminDashboard, type DashboardData } from '@/lib/services/admin/dashboard';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

export interface AdminDashboardContentProps {
  dateRange?: DateRange | undefined;
}

export function AdminDashboardContent({ dateRange: dateRangeProp }: AdminDashboardContentProps = {}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: startOfYear(today), to: endOfYear(today) };
  });
  const dateRange = dateRangeProp ?? internalDateRange;

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch dashboard data
  const fetchDashboard = async (from: string, to: string) => {
    setLoading(true);
    try {
      const response = await getAdminDashboard(from, to);
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res?.success && res.data) {
            setData(res.data);
          } else {
            setData(null);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch dashboard:', errorMessage);
          toast.error(errorMessage || 'Failed to load dashboard data');
          setData(null);
        },
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Unexpected error while loading dashboard data');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const startDate = formatDateForAPI(dateRange.from);
      const endDate = formatDateForAPI(dateRange.to);
      fetchDashboard(startDate, endDate);
    }
  }, [dateRange]);

  // Chart data for transaction statistics
  const transactionChartData = useMemo(() => {
    if (!data?.transactionStatistics) return null;

    const stats = data.transactionStatistics;
    return {
      pie: {
        series: [
          stats.successCount,
          stats.declineCount,
          stats.chargebackCount,
          stats.refundCount,
        ],
        labels: ['Success', 'Decline', 'Chargeback', 'Refund'],
      },
      bar: {
        categories: ['Success', 'Decline', 'Chargeback', 'Refund'],
        data: [
          stats.successCount,
          stats.declineCount,
          stats.chargebackCount,
          stats.refundCount,
        ],
      },
    };
  }, [data]);

  // Pie chart options for transaction statistics
  const pieChartOptions = useMemo(() => ({
    chart: {
      type: 'pie' as const,
      toolbar: { show: false },
    },
    labels: transactionChartData?.pie.labels || [],
    colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
    legend: {
      position: 'bottom' as const,
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(1)}%`,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
  }), [transactionChartData]);

  // Bar chart options for transaction statistics
  const barChartOptions = useMemo(() => ({
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        distributed: true,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => val.toLocaleString(),
    },
    xaxis: {
      categories: transactionChartData?.bar.categories || [],
    },
    colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
    legend: {
      show: false,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
  }), [transactionChartData]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !data ? (
        <div className="text-center py-20 text-muted-foreground">
          No data available for the selected date range
        </div>
      ) : (
        <>
          {/* User Counters */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Admins Card */}
            <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-red-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">Admins</CardTitle>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/70 transition-colors duration-300">
                  <UserCog className="h-5 w-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
                  {data.userCounters.totalAdmin.toLocaleString()}
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-300/70 font-medium">
                  Administrative users
                </p>
              </CardContent>
            </Card>

            {/* Merchants Card */}
            <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/30 dark:to-cyan-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Merchants</CardTitle>
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/70 transition-colors duration-300">
                  <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
                  {data.userCounters.totalMerchant.toLocaleString()}
                </div>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-300/70 font-medium">
                  Merchant accounts
                </p>
              </CardContent>
            </Card>

            {/* Affiliates Card */}
            <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-violet-50 via-fuchsia-50 to-pink-50 dark:from-violet-950/30 dark:via-fuchsia-950/30 dark:to-pink-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-violet-700 dark:text-violet-300">Affiliates</CardTitle>
                <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/70 transition-colors duration-300">
                  <Users className="h-5 w-5 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-violet-900 dark:text-violet-100 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
                  {data.userCounters.totalAffiliate.toLocaleString()}
                </div>
                <p className="text-xs text-violet-600/70 dark:text-violet-300/70 font-medium">
                  Affiliate partners
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Statistics */}
          <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-4">
            {/* Success Card */}
            <Card className="relative overflow-hidden border-green-200/30 dark:border-green-900/30 bg-linear-to-br from-green-500/5 to-green-500/10 shadow-md shadow-green-500/10 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="absolute bottom-0 right-0 opacity-10">
                <CheckCircle2 className="h-32 w-32 text-green-600 dark:text-green-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
                  <span className="flex-1">Success</span>
                  <div className="p-2 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-2">{data.transactionStatistics.successCount.toLocaleString()}</div>
                <div className="flex items-center gap-1">
                  <Badge variant="success" appearance="light" size="sm" className="text-xs">
                    {data.transactionStatistics.successPercentage.toFixed(1)}% success rate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Declined Card */}
            <Card className="relative overflow-hidden border-red-200/30 dark:border-red-900/30 bg-linear-to-br from-red-500/5 to-red-500/10 shadow-md shadow-red-500/10 hover:shadow-lg hover:shadow-red-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="absolute bottom-0 right-0 opacity-10">
                <TrendingDown className="h-32 w-32 text-red-600 dark:text-red-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
                  <span className="flex-1">Declined</span>
                  <div className="p-2 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                    <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-2">{data.transactionStatistics.declineCount.toLocaleString()}</div>
                <div className="flex items-center gap-1">
                  <Badge variant="destructive" appearance="light" size="sm" className="text-xs">
                    {data.transactionStatistics.declinePercentage.toFixed(1)}% decline rate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Chargebacks Card */}
            <Card className="relative overflow-hidden border-amber-200/30 dark:border-amber-900/30 bg-linear-to-br from-amber-500/5 to-amber-500/10 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="absolute bottom-0 right-0 opacity-10">
                <XCircle className="h-32 w-32 text-amber-600 dark:text-amber-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
                  <span className="flex-1">Chargebacks</span>
                  <div className="p-2 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-2">{data.transactionStatistics.chargebackCount.toLocaleString()}</div>
                <div className="flex items-center gap-1">
                  <Badge variant="warning" appearance="light" size="sm" className="text-xs">
                    {data.transactionStatistics.chargebackPercentage.toFixed(1)}% chargeback rate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Refunds Card */}
            <Card className="relative overflow-hidden border-blue-200/30 dark:border-blue-900/30 bg-linear-to-br from-blue-500/5 to-blue-500/10 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="absolute bottom-0 right-0 opacity-10">
                <RefreshCw className="h-32 w-32 text-blue-600 dark:text-blue-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
                  <span className="flex-1">Refunds</span>
                  <div className="p-2 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                    <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-2">{data.transactionStatistics.refundCount.toLocaleString()}</div>
                <div className="flex items-center gap-1">
                  <Badge variant="info" appearance="light" size="sm" className="text-xs">
                    {data.transactionStatistics.refundPercentage.toFixed(1)}% refund rate
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Statistics Charts */}
          {transactionChartData && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Distribution</CardTitle>
                  <CardDescription>Pie chart showing transaction types</CardDescription>
                </CardHeader>
                <CardContent>
                  <DynamicApexChart
                    type="pie"
                    series={transactionChartData.pie.series}
                    options={pieChartOptions}
                    height={350}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transaction Counts</CardTitle>
                  <CardDescription>Bar chart showing transaction volumes</CardDescription>
                </CardHeader>
                <CardContent>
                  <DynamicApexChart
                    type="bar"
                    series={[{ name: 'Count', data: transactionChartData.bar.data }]}
                    options={barChartOptions}
                    height={350}
                  />
                </CardContent>
              </Card>
            </div>
          )}

        </>
      )}
    </div>
  );
}

