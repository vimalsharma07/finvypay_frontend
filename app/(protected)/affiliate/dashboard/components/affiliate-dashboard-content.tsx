'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  TrendingDown,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getAffiliateDashboard, type AffiliateDashboardData } from '@/lib/services/affiliate/dashboard';
import { getAffiliateOnboardingStatus, type AffiliateOnboardingStatusData } from '@/lib/services/affiliate/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { DynamicApexChart } from '@/components/charts/dynamic-apex-chart';
import { AffiliateOnboardingCard } from './affiliate-onboarding-card';

export interface AffiliateDashboardContentProps {
  dateRange?: DateRange | undefined;
}

/**
 * Affiliate Dashboard Content
 * Transaction statistics and charts; design aligned with merchant dashboard.
 * When dateRange is undefined, no date filter is applied (all-time/default).
 */
export function AffiliateDashboardContent({ dateRange }: AffiliateDashboardContentProps = {}) {
  const [dashboardData, setDashboardData] = useState<AffiliateDashboardData | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<AffiliateOnboardingStatusData | null>(null);
  const [onboardingStatusLoading, setOnboardingStatusLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  const fetchDashboard = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const response = await getAffiliateDashboard(
        from && to ? { from, to } : undefined
      );
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res?.success && res.data) {
            setDashboardData(res.data);
          } else {
            setDashboardData(null);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch affiliate dashboard:', errorMessage);
          toast.error(errorMessage || 'Failed to load dashboard data');
          setDashboardData(null);
        },
        silent: true,
      });
    } catch (error) {
      console.error('Affiliate dashboard fetch error:', error);
      toast.error('Unexpected error while loading dashboard data');
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchOnboardingStatus = async () => {
    setOnboardingStatusLoading(true);
    try {
      const res = await getAffiliateOnboardingStatus();
      handleApiResponse(res, {
        onSuccess: (data) => {
          if (data?.success && data.data) setOnboardingStatus(data.data);
          else setOnboardingStatus(null);
        },
        onError: () => setOnboardingStatus(null),
        silent: true,
      });
    } catch {
      setOnboardingStatus(null);
    } finally {
      setOnboardingStatusLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchDashboard(formatDateForAPI(dateRange.from), formatDateForAPI(dateRange.to));
    } else {
      fetchDashboard();
    }
  }, [dateRange]);

  const stats = useMemo(() => {
    if (!dashboardData?.transactionStatistics) {
      return {
        successCount: 0,
        declineCount: 0,
        chargebackCount: 0,
        refundCount: 0,
        successPercentage: 0,
        declinePercentage: 0,
        chargebackPercentage: 0,
        refundPercentage: 0,
        totalTransactions: 0,
      };
    }
    const s = dashboardData.transactionStatistics;
    return {
      successCount: s.successCount,
      declineCount: s.declineCount,
      chargebackCount: s.chargebackCount,
      refundCount: s.refundCount,
      successPercentage: s.successPercentage,
      declinePercentage: s.declinePercentage,
      chargebackPercentage: s.chargebackPercentage,
      refundPercentage: s.refundPercentage,
      totalTransactions: s.totalTransactions,
    };
  }, [dashboardData]);

  const transactionChartData = useMemo(() => {
    if (!dashboardData?.transactionStatistics) return null;
    const s = dashboardData.transactionStatistics;
    return {
      distribution: {
        series: [
          s.successCount,
          s.declineCount,
          s.chargebackCount,
          s.refundCount,
        ],
        labels: ['Success', 'Decline', 'Chargeback', 'Refund'],
      },
    };
  }, [dashboardData]);

  const distributionChartOptions = useMemo(() => {
    if (!transactionChartData) return {};
    const total = transactionChartData.distribution.series.reduce((a, b) => a + b, 0);
    const percentages = transactionChartData.distribution.series.map((val) =>
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
          borderRadiusApplication: 'end' as const,
          distributed: true,
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number, { dataPointIndex }: { dataPointIndex: number }) => {
          const count = transactionChartData.distribution.series[dataPointIndex];
          const pct = percentages[dataPointIndex];
          return `${count.toLocaleString()} (${pct}%)`;
        },
        style: { fontSize: '12px', fontWeight: 600, colors: ['#fff'] },
        offsetX: 10,
        dropShadow: { enabled: true, top: 1, left: 1, blur: 2, opacity: 0.3 },
      },
      xaxis: {
        categories: transactionChartData.distribution.labels,
        labels: { style: { fontSize: '13px', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { fontSize: '13px', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      colors: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'],
      legend: { show: false },
      tooltip: {
        enabled: true,
        y: {
          formatter: (val: number, { dataPointIndex }: { dataPointIndex: number }) => {
            const count = transactionChartData.distribution.series[dataPointIndex];
            const pct = percentages[dataPointIndex];
            const label = transactionChartData.distribution.labels[dataPointIndex];
            return `${label}: ${count.toLocaleString()} (${pct}%)`;
          },
        },
        style: { fontSize: '13px' },
        theme: 'dark',
      },
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
        padding: { top: 0, right: 10, bottom: 0, left: 0 },
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

  // Transaction volume trend over time (from connectorTransactionsSummary grouped by date, same as merchant)
  const transactionVolumeTrendData = useMemo(() => {
    if (!dashboardData?.connectorTransactionsSummary || !Array.isArray(dashboardData.connectorTransactionsSummary)) return null;
    const firstItem = dashboardData.connectorTransactionsSummary[0];
    if (!firstItem || !('date' in firstItem)) return null;

    const dateMap = new Map<string, { count: number; amount: number }>();
    dashboardData.connectorTransactionsSummary.forEach((item: Record<string, unknown>) => {
      const date = item.date as string | undefined;
      if (date) {
        const existing = dateMap.get(date) || { count: 0, amount: 0 };
        dateMap.set(date, {
          count: existing.count + (Number(item.transaction_count) || 0),
          amount: existing.amount + (Number(item.amount_in_usd) || 0),
        });
      }
    });

    const sortedDates = Array.from(dateMap.keys()).sort();
    return {
      dates: sortedDates,
      volumes: sortedDates.map((date) => dateMap.get(date)!.amount),
      counts: sortedDates.map((date) => dateMap.get(date)!.count),
    };
  }, [dashboardData]);

  const transactionTrendChartOptions = useMemo(() => {
    if (!transactionVolumeTrendData) return {};

    return {
      chart: {
        type: 'line' as const,
        toolbar: { show: false },
        fontFamily: 'inherit',
        zoom: { enabled: false },
      },
      dataLabels: { enabled: false },
      stroke: {
        curve: 'smooth' as const,
        width: 3,
      },
      markers: {
        size: 4,
        hover: { size: 6 },
      },
      xaxis: {
        categories: transactionVolumeTrendData.dates,
        labels: {
          style: { fontSize: '12px' },
          rotate: -45,
          rotateAlways: false,
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: [
        {
          title: { text: 'Volume (USD)', style: { fontSize: '12px' } },
          labels: {
            formatter: (val: number) =>
              `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
            style: { fontSize: '12px' },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        {
          opposite: true,
          title: { text: 'Transaction Count', style: { fontSize: '12px' } },
          labels: {
            formatter: (val: number) => val.toLocaleString(),
            style: { fontSize: '12px' },
          },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
      ],
      colors: ['#3b82f6', '#10b981'],
      legend: {
        show: true,
        position: 'top' as const,
        horizontalAlign: 'right' as const,
        fontSize: '13px',
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        y: {
          formatter: (val: number, { seriesIndex, dataPointIndex }: { seriesIndex?: number; dataPointIndex?: number }) => {
            if (seriesIndex === 0) {
              const count = transactionVolumeTrendData.counts[dataPointIndex ?? 0];
              return `Volume: $${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} · Count: ${count.toLocaleString()}`;
            }
            return `${val.toLocaleString()} transactions`;
          },
        },
        style: { fontSize: '13px' },
        theme: 'dark',
      },
      grid: {
        borderColor: 'var(--color-border)',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 10, right: 10, bottom: 0, left: 0 },
      },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.5, opacityTo: 0.15, stops: [0, 90, 100] },
      },
    };
  }, [transactionVolumeTrendData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 mt-5 lg:mt-7.5">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Fragment>
      <AffiliateOnboardingCard
        statusData={onboardingStatus}
        loading={onboardingStatusLoading}
      />
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-4 mt-5 lg:mt-7.5">
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
            <div className="text-3xl font-bold mb-2">{stats.successCount.toLocaleString()}</div>
            <Badge variant="success" appearance="light" size="sm" className="text-xs">
              {stats.successPercentage.toFixed(1)}% success rate
            </Badge>
          </CardContent>
        </Card>

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
            <div className="text-3xl font-bold mb-2">{stats.declineCount.toLocaleString()}</div>
            <Badge variant="destructive" appearance="light" size="sm" className="text-xs">
              {stats.declinePercentage.toFixed(1)}% decline rate
            </Badge>
          </CardContent>
        </Card>

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
            <div className="text-3xl font-bold mb-2">{stats.chargebackCount.toLocaleString()}</div>
            <Badge variant="warning" appearance="light" size="sm" className="text-xs">
              {stats.chargebackPercentage.toFixed(1)}% chargeback rate
            </Badge>
          </CardContent>
        </Card>

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
            <div className="text-3xl font-bold mb-2">{stats.refundCount.toLocaleString()}</div>
            <Badge variant="info" appearance="light" size="sm" className="text-xs">
              {stats.refundPercentage.toFixed(1)}% refund rate
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Status Breakdown */}
      <div className="grid gap-5 lg:gap-7.5 md:grid-cols-2 mt-5 lg:mt-7.5">
        {transactionChartData && (
          <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-base font-semibold">Transaction Status Breakdown</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Distribution of referred merchants&apos; transactions by status
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DynamicApexChart
                type="bar"
                series={[{ name: 'Transactions', data: transactionChartData.distribution.series }]}
                options={distributionChartOptions}
                height={280}
              />
            </CardContent>
          </Card>
        )}

        {/* Transaction Volume & Count Trend (same as merchant / admin) */}
        {transactionVolumeTrendData && transactionVolumeTrendData.dates.length > 0 ? (
          <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-base font-semibold">Transaction Volume & Count Trend</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Daily transaction volume (USD) and count over selected period for referred merchants
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <DynamicApexChart
                type="line"
                series={[
                  { name: 'Volume (USD)', type: 'area', data: transactionVolumeTrendData.volumes },
                  { name: 'Transaction Count', type: 'line', data: transactionVolumeTrendData.counts },
                ]}
                options={transactionTrendChartOptions}
                height={300}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="relative overflow-hidden border-border shadow-md hover:shadow-lg transition-all duration-300">
            <CardHeader className="border-b border-border/50 bg-muted/30">
              <CardTitle className="text-base font-semibold">Transaction Volume & Count Trend</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Daily transaction volume (USD) and count over selected period for referred merchants
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-16 text-muted-foreground text-sm">
                No trend data available for the selected date range
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Fragment>
  );
}
