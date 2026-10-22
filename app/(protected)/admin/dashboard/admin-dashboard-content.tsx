'use client';

import { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
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
  merchantId?: string;
}

export function AdminDashboardContent({ dateRange: dateRangeProp, merchantId: merchantIdProp = 'all' }: AdminDashboardContentProps = {}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(merchantIdProp);
  const [internalDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: startOfMonth(today), to: endOfMonth(today) };
  });
  const dateRange = dateRangeProp ?? internalDateRange;

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Update selectedMerchantId when prop changes
  useEffect(() => {
    setSelectedMerchantId(merchantIdProp);
  }, [merchantIdProp]);

  // Fetch dashboard data
  const fetchDashboard = async (from: string, to: string, merchantId?: number) => {
    setLoading(true);
    try {
      const response = await getAdminDashboard(from, to, merchantId);
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

  // Initial fetch and when date range or merchant changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const startDate = formatDateForAPI(dateRange.from);
      const endDate = formatDateForAPI(dateRange.to);
      const merchantId = selectedMerchantId === 'all' ? undefined : parseInt(selectedMerchantId, 10);
      fetchDashboard(startDate, endDate, merchantId);
    }
  }, [dateRange, selectedMerchantId]);

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
          borderRadiusApplication: 'end' as const,
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

  // Combined transaction volume & count trend (dual-axis chart)
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
            formatter: (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
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
      colors: ['#38BDF8', '#10b981'],
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
          formatter: (val: number, { seriesIndex, dataPointIndex }: any) => {
            if (seriesIndex === 0) {
              const count = transactionVolumeTrendData.counts[dataPointIndex];
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

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-sky-100 bg-sky-50/50 py-16 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
          No data available for the selected date range
        </div>
      ) : (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_45%,#e0f2fe_100%)] p-5 sm:p-6 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_50%,#082f49_100%)]">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700/80 dark:text-sky-300/80">
              Platform pulse
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Control Hub snapshot
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Partner counts and money-flow health for the selected period.
            </p>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <h3 className="text-sm font-semibold text-foreground">People Directory</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-sky-100 bg-card p-4 shadow-sm ring-1 ring-sky-500/5 transition hover:shadow-md dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Platform Admins</p>
                  <span className="inline-flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <UserCog className="size-4" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{data.userCounters.totalAdmin.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">Administrative users</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-card p-4 shadow-sm ring-1 ring-sky-500/5 transition hover:shadow-md dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Merchant Partners</p>
                  <span className="inline-flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                    <UserCheck className="size-4" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{data.userCounters.totalMerchant.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">Merchant accounts</p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-card p-4 shadow-sm ring-1 ring-sky-500/5 transition hover:shadow-md dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Affiliate Partners</p>
                  <span className="inline-flex size-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                    <Users className="size-4" />
                  </span>
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{data.userCounters.totalAffiliate.toLocaleString()}</p>
                <p className="mt-1 text-xs text-muted-foreground">Affiliate partners</p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <h3 className="text-sm font-semibold text-foreground">Money Flow</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border-l-4 border-l-emerald-500 border border-sky-100 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Approved</p>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{data.transactionStatistics.successCount.toLocaleString()}</p>
                <Badge variant="success" appearance="light" size="sm" className="mt-2 text-xs">
                  {data.transactionStatistics.successPercentage.toFixed(1)}% success rate
                </Badge>
              </div>
              <div className="rounded-2xl border-l-4 border-l-red-500 border border-sky-100 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Declined</p>
                  <TrendingDown className="size-4 text-red-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{data.transactionStatistics.declineCount.toLocaleString()}</p>
                <Badge variant="destructive" appearance="light" size="sm" className="mt-2 text-xs">
                  {data.transactionStatistics.declinePercentage.toFixed(1)}% decline rate
                </Badge>
              </div>
              <div className="rounded-2xl border-l-4 border-l-amber-500 border border-sky-100 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Chargebacks</p>
                  <XCircle className="size-4 text-amber-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{data.transactionStatistics.chargebackCount.toLocaleString()}</p>
                <Badge variant="warning" appearance="light" size="sm" className="mt-2 text-xs">
                  {data.transactionStatistics.chargebackPercentage.toFixed(1)}% chargeback rate
                </Badge>
              </div>
              <div className="rounded-2xl border-l-4 border-l-sky-500 border border-sky-100 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Refunds</p>
                  <RefreshCw className="size-4 text-sky-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{data.transactionStatistics.refundCount.toLocaleString()}</p>
                <Badge variant="info" appearance="light" size="sm" className="mt-2 text-xs">
                  {data.transactionStatistics.refundPercentage.toFixed(1)}% refund rate
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {transactionChartData && (
              <Card className="overflow-hidden rounded-2xl border-sky-100 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
                <CardHeader className="border-b border-sky-100/80 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <CardTitle className="text-base font-semibold">Status Mix</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    How payments split across outcomes
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

            {transactionVolumeTrendData && transactionVolumeTrendData.dates.length > 0 ? (
              <Card className="overflow-hidden rounded-2xl border-sky-100 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
                <CardHeader className="border-b border-sky-100/80 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <CardTitle className="text-base font-semibold">Volume Trail</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Daily volume (USD) and payment count
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
              <Card className="overflow-hidden rounded-2xl border-sky-100 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
                <CardHeader className="border-b border-sky-100/80 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <CardTitle className="text-base font-semibold">Volume Trail</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Daily volume (USD) and payment count
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="py-16 text-center text-sm text-muted-foreground">
                    No trend data available for the selected date range
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {data.connectorPerformance && data.connectorPerformance.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Bank Partner Health</h2>
                  <p className="text-sm text-muted-foreground">Approved vs declined rates by connector</p>
                </div>
                <Badge className="rounded-full border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300">
                  {data.connectorPerformance.length} connector{data.connectorPerformance.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                {data.connectorPerformance.map((connector) => {
                  const total = connector.success_count + connector.decline_count;
                  const successWidth = total > 0 ? connector.success_percentage : 0;
                  return (
                    <Card
                      key={connector.connector_name}
                      className="overflow-hidden rounded-2xl border border-sky-100 bg-card shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40"
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-semibold text-foreground">
                          {connector.connector_name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              ${connector.success_amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {connector.success_count} transaction{connector.success_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                              ${connector.decline_amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {connector.decline_count} transaction{connector.decline_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-l-full bg-emerald-500 transition-all"
                              style={{ width: `${successWidth}%` }}
                            />
                            <div
                              className="h-full rounded-r-full bg-red-500 transition-all"
                              style={{ width: `${100 - successWidth}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Success {connector.success_percentage}%
                            </span>
                            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                              {connector.decline_percentage}% Decline
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

