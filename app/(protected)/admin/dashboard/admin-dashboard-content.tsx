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
      distribution: {
        series: [
          stats.successCount,
          stats.declineCount,
          stats.chargebackCount,
          stats.refundCount,
        ],
        labels: ['Success', 'Decline', 'Chargeback', 'Refund'],
      },
    };
  }, [data]);

  // Transaction volume trend over time (from connectorTransactionsSummary grouped by date)
  const transactionVolumeTrendData = useMemo(() => {
    if (!data?.connectorTransactionsSummary || !Array.isArray(data.connectorTransactionsSummary)) return null;
    
    // Check if data is grouped by date (has 'date' field)
    const firstItem = data.connectorTransactionsSummary[0];
    if (!firstItem || !('date' in firstItem)) return null;

    // Group by date and sum amounts
    const dateMap = new Map<string, { count: number; amount: number }>();
    
    data.connectorTransactionsSummary.forEach((item: any) => {
      const date = item.date;
      if (date) {
        const existing = dateMap.get(date) || { count: 0, amount: 0 };
        dateMap.set(date, {
          count: existing.count + (item.transaction_count || 0),
          amount: existing.amount + (item.amount_in_usd || 0),
        });
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    
    return {
      dates: sortedDates,
      volumes: sortedDates.map(date => dateMap.get(date)!.amount),
      counts: sortedDates.map(date => dateMap.get(date)!.count),
    };
  }, [data]);

  // Success rate trend over time
  const successRateTrendData = useMemo(() => {
    if (!data?.connectorTransactionsSummary || !Array.isArray(data.connectorTransactionsSummary)) return null;
    
    const firstItem = data.connectorTransactionsSummary[0];
    if (!firstItem || !('date' in firstItem)) return null;

    // We need to calculate success vs decline by date
    // Since connectorTransactionsSummary doesn't have status breakdown, we'll use total transactions
    // For a proper success rate, we'd need backend to provide this, but for now we'll show transaction volume trend
    return null; // Will be implemented when backend provides status-by-date data
  }, [data]);

  // Transaction distribution horizontal bar chart options
  const transactionDistributionChartOptions = useMemo(() => {
    if (!transactionChartData) return {};

    const total = transactionChartData.distribution.series.reduce((a: number, b: number) => a + b, 0);
    const percentages = transactionChartData.distribution.series.map((val: number) => 
      total > 0 ? parseFloat(((val / total) * 100).toFixed(1)) : 0
    );

    return {
      chart: {
        type: 'bar' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: '75%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, { dataPointIndex }: any) => {
          const count = transactionChartData.distribution.series[dataPointIndex];
          const percentage = percentages[dataPointIndex];
          return `${count.toLocaleString()} (${percentage}%)`;
        },
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#fff'],
        },
        offsetX: 10,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          opacity: 0.3,
        },
      },
      xaxis: {
        categories: transactionChartData.distribution.labels,
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: 500,
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: 500,
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
      legend: {
        show: false,
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number, { dataPointIndex }: any) => {
            const count = transactionChartData.distribution.series[dataPointIndex];
            const percentage = percentages[dataPointIndex];
            const label = transactionChartData.distribution.labels[dataPointIndex];
            return `${label}: ${count.toLocaleString()} (${percentage}%)`;
          },
        },
        style: {
          fontSize: '13px',
        },
        theme: 'dark',
      },
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
        padding: {
          top: 0,
          right: 10,
          bottom: 0,
          left: 0,
        },
      },
      fill: {
        opacity: 0.9,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.3,
          gradientToColors: undefined,
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0.7,
          stops: [0, 50, 100],
        },
      },
    };
  }, [transactionChartData]);

  // Transaction volume trend over time (area chart)
  const transactionVolumeTrendOptions = useMemo(() => {
    if (!transactionVolumeTrendData) return {};

    return {
      chart: {
        type: 'area' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth' as const,
        width: 3,
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: transactionVolumeTrendData.dates,
        labels: {
          style: {
            fontSize: '12px',
          },
          rotate: -45,
          rotateAlways: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          style: {
            fontSize: '12px',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      colors: ['#3b82f6'],
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number, { dataPointIndex }: any) => {
            const date = transactionVolumeTrendData.dates[dataPointIndex];
            const count = transactionVolumeTrendData.counts[dataPointIndex];
            return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br/>${count.toLocaleString()} transactions`;
          },
        },
        style: {
          fontSize: '13px',
        },
        theme: 'dark',
      },
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
    };
  }, [transactionVolumeTrendData]);

  // Transaction count trend over time (line chart)
  const transactionCountTrendOptions = useMemo(() => {
    if (!transactionVolumeTrendData) return {};

    return {
      chart: {
        type: 'line' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth' as const,
        width: 3,
      },
      markers: {
        size: 5,
        hover: {
          size: 7,
        },
      },
      xaxis: {
        categories: transactionVolumeTrendData.dates,
        labels: {
          style: {
            fontSize: '12px',
          },
          rotate: -45,
          rotateAlways: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => val.toLocaleString(),
          style: {
            fontSize: '12px',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      colors: ['#10b981'],
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number, { dataPointIndex }: any) => {
            const date = transactionVolumeTrendData.dates[dataPointIndex];
            return `${val.toLocaleString()} transactions`;
          },
        },
        style: {
          fontSize: '13px',
        },
        theme: 'dark',
      },
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: false,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        },
      },
    };
  }, [transactionVolumeTrendData]);


  // Acquirer-wise volumes chart data
  const acquirerVolumesChartData = useMemo(() => {
    if (!data?.acquirerWiseVolumes) {
      return null;
    }
    
    if (data.acquirerWiseVolumes.length === 0) {
      return null;
    }

    const volumes = data.acquirerWiseVolumes;
    return {
      categories: volumes.map((v) => v.acquirerName),
      amounts: volumes.map((v) => parseFloat(v.totalAmountUsd.toFixed(2))),
    };
  }, [data]);

  // Acquirer volumes bar chart options
  const acquirerVolumesChartOptions = useMemo(() => {
    if (!acquirerVolumesChartData) return {};

    return {
      chart: {
        type: 'bar' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      plotOptions: {
        bar: {
          horizontal: true,
          columnWidth: '70%',
          borderRadius: 6,
          borderRadiusApplication: 'end',
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        style: {
          fontSize: '12px',
          fontWeight: 600,
          colors: ['#fff'],
        },
        offsetX: 10,
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          opacity: 0.3,
        },
      },
      xaxis: {
        categories: acquirerVolumesChartData.categories,
        labels: {
          style: {
            fontSize: '13px',
            fontWeight: 500,
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          style: {
            fontSize: '12px',
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      colors: ['#3b82f6'],
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        },
        style: {
          fontSize: '13px',
        },
        theme: 'dark',
      },
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
        padding: {
          top: 0,
          right: 10,
          bottom: 0,
          left: 0,
        },
      },
      fill: {
        opacity: 0.9,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.3,
          gradientToColors: ['#2563eb'],
          inverseColors: false,
          opacityFrom: 0.9,
          opacityTo: 0.7,
          stops: [0, 50, 100],
        },
      },
    };
  }, [acquirerVolumesChartData]);

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
          <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-3">
            {/* Admins Card */}
            <Card className="relative overflow-hidden border-amber-200/30 dark:border-amber-900/30 bg-linear-to-br from-amber-500/5 to-amber-500/10 shadow-md shadow-amber-500/10 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="absolute bottom-0 right-0 opacity-10">
                <UserCog className="h-32 w-32 text-amber-600 dark:text-amber-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
                  <span className="flex-1">Admins</span>
                  <div className="p-2 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <UserCog className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-2">{data.userCounters.totalAdmin.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Administrative users
                </p>
              </CardContent>
            </Card>

            {/* Merchants Card */}
            <Card className="relative overflow-hidden border-emerald-200/30 dark:border-emerald-900/30 bg-linear-to-br from-emerald-500/5 to-emerald-500/10 shadow-md shadow-emerald-500/10 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="absolute bottom-0 right-0 opacity-10">
                <UserCheck className="h-32 w-32 text-emerald-600 dark:text-emerald-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
                  <span className="flex-1">Merchants</span>
                  <div className="p-2 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-2">{data.userCounters.totalMerchant.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Merchant accounts
                </p>
              </CardContent>
            </Card>

            {/* Affiliates Card */}
            <Card className="relative overflow-hidden border-violet-200/30 dark:border-violet-900/30 bg-linear-to-br from-violet-500/5 to-violet-500/10 shadow-md shadow-violet-500/10 hover:shadow-lg hover:shadow-violet-500/20 transition-all duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full -mr-10 -mt-10 blur-2xl" />
              <div className="absolute bottom-0 right-0 opacity-10">
                <Users className="h-32 w-32 text-violet-600 dark:text-violet-500" />
              </div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
                  <span className="flex-1">Affiliates</span>
                  <div className="p-2 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold mb-2">{data.userCounters.totalAffiliate.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
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
          <div className="grid gap-5 lg:gap-7.5 md:grid-cols-2">
            {/* Transaction Distribution by Status */}
            {transactionChartData && (
              <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="text-base font-semibold">Transaction Status Breakdown</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Current distribution of transactions by status type
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <DynamicApexChart
                    type="bar"
                    series={[{ name: 'Transactions', data: transactionChartData.distribution.series }]}
                    options={transactionDistributionChartOptions}
                    height={280}
                  />
                </CardContent>
              </Card>
            )}

            {/* Transaction Volume Trend Over Time */}
            {transactionVolumeTrendData && transactionVolumeTrendData.dates.length > 0 ? (
              <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="text-base font-semibold">Transaction Volume Trend</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Daily transaction volume (USD) over selected period
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <DynamicApexChart
                    type="area"
                    series={[{ name: 'Volume (USD)', data: transactionVolumeTrendData.volumes }]}
                    options={transactionVolumeTrendOptions}
                    height={280}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <CardTitle className="text-base font-semibold">Transaction Volume Trend</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Daily transaction volume (USD) over selected period
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-16 text-muted-foreground text-sm">
                    No volume trend data available for the selected date range
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Transaction Count Trend Over Time */}
          {transactionVolumeTrendData && transactionVolumeTrendData.dates.length > 0 && (
            <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
              <CardHeader className="border-b border-border/50 bg-muted/30">
                <CardTitle className="text-base font-semibold">Transaction Count Trend</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Daily transaction count trend over selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <DynamicApexChart
                  type="line"
                  series={[{ name: 'Transaction Count', data: transactionVolumeTrendData.counts }]}
                  options={transactionCountTrendOptions}
                  height={300}
                />
              </CardContent>
            </Card>
          )}

          {/* Acquirer-wise Transaction Volumes Chart */}
          <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-base font-semibold">Acquirer-wise Transaction Volumes</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Total transaction volumes grouped by acquirer (USD)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {acquirerVolumesChartData && acquirerVolumesChartData.categories.length > 0 ? (
                <DynamicApexChart
                  type="bar"
                  series={[{ name: 'Volume (USD)', data: acquirerVolumesChartData.amounts }]}
                  options={acquirerVolumesChartOptions}
                  height={Math.max(350, acquirerVolumesChartData.categories.length * 60)}
                />
              ) : data && Array.isArray(data.acquirerWiseVolumes) ? (
                <div className="text-center py-16">
                  <div className="text-muted-foreground text-sm">
                    No transaction data available for the selected date range
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-muted-foreground text-sm">
                    {loading ? 'Loading acquirer volumes data...' : 'No acquirer data available'}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

        </>
      )}
    </div>
  );
}

