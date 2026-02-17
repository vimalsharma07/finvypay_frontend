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
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Success Card */}
            <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Success</CardTitle>
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-900/70 transition-colors duration-300">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
                  {data.transactionStatistics.successCount.toLocaleString()}
                </div>
                <p className="text-xs text-green-600/70 dark:text-green-300/70 font-medium">
                  {data.transactionStatistics.successPercentage.toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>

            {/* Declined Card */}
            <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/30 dark:via-rose-950/30 dark:to-pink-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-rose-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-red-700 dark:text-red-300">Declined</CardTitle>
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50 group-hover:bg-red-200 dark:group-hover:bg-red-900/70 transition-colors duration-300">
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 group-hover:scale-110 group-hover:translate-y-1 transition-transform duration-300" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
                  {data.transactionStatistics.declineCount.toLocaleString()}
                </div>
                <p className="text-xs text-red-600/70 dark:text-red-300/70 font-medium">
                  {data.transactionStatistics.declinePercentage.toFixed(1)}% decline rate
                </p>
              </CardContent>
            </Card>

            {/* Chargebacks Card */}
            <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300">Chargebacks</CardTitle>
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/70 transition-colors duration-300">
                  <XCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:rotate-90 transition-transform duration-300" />
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
                  {data.transactionStatistics.chargebackCount.toLocaleString()}
                </div>
                <p className="text-xs text-amber-600/70 dark:text-amber-300/70 font-medium">
                  {data.transactionStatistics.chargebackPercentage.toFixed(1)}% chargeback rate
                </p>
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

