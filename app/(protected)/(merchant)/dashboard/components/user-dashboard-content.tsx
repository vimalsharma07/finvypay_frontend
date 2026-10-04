'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingDown,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Ticket,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { getOnboardingStatus, OnboardingData } from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { OnboardingCard } from './onboarding-card';
import { TwoFaBanner } from './two-fa-banner';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMerchantRates, updateMerchantRatesStatus, MerchantRates } from '@/lib/services/user/merchant-rates';
import { getMerchantDashboard, type MerchantDashboardData } from '@/lib/services/user/dashboard';
import { toast } from 'sonner';
import { DynamicApexChart } from '@/components/charts/dynamic-apex-chart';

export interface UserDashboardContentProps {
  dateRange?: DateRange | undefined;
}

/**
 * User Dashboard Content Component
 *
 * Displays user-specific dashboard widgets and statistics
 */
export function UserDashboardContent({ dateRange: dateRangeProp }: UserDashboardContentProps = {}) {
  const { user } = useAuth();
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [merchantRates, setMerchantRates] = useState<MerchantRates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [actioningRate, setActioningRate] = useState(false);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [showTwoFaBanner, setShowTwoFaBanner] = useState(false);
  const [dashboardData, setDashboardData] = useState<MerchantDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [internalDateRange] = useState<DateRange | undefined>(() => {
    const today = new Date();
    return { from: startOfMonth(today), to: endOfMonth(today) };
  });
  const dateRange = dateRangeProp ?? internalDateRange;

  // Get full user data from localStorage (includes isTwoFaEnabled)
  // Zustand store only has id, email, role, so we need to check localStorage directly
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setShowTwoFaBanner(userData && userData.isTwoFaEnabled === false);
        }
      } catch (error) {
        console.error('Failed to read user data from localStorage:', error);
      }
    }
  }, []);

  // Fetch onboarding status
  useEffect(() => {
    const fetchOnboarding = async () => {
      setOnboardingLoading(true);
      try {
        const response = await getOnboardingStatus();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setOnboardingData(data.data);
            }
          },
          onError: (errorMessage) => {
            console.error('Failed to fetch onboarding status:', errorMessage);
          },
        });
      } catch (error) {
        console.error('Onboarding fetch error:', error);
      } finally {
        setOnboardingLoading(false);
      }
    };

    fetchOnboarding();
  }, []);

  useEffect(() => {
    const fetchRates = async () => {
      setRatesLoading(true);
      try {
        const response = await getMerchantRates();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data?.success && data.data?.merchantRates) {
              setMerchantRates(data.data.merchantRates);
              if (data.data.merchantRates.status === 'pending') {
                setShowRatesModal(true);
              }
            } else {
              setMerchantRates(null);
            }
          },
          onError: (message) => {
            console.error('Failed to fetch merchant rates:', message);
          },
          silent: true,
        });
      } catch (error) {
        console.error('Merchant rates fetch error:', error);
      } finally {
        setRatesLoading(false);
      }
    };

    fetchRates();
  }, []);

  const handleRatesStatusChange = async (status: 'approved' | 'rejected') => {
    if (!merchantRates) return;
    setActioningRate(true);
    try {
      const response = await updateMerchantRatesStatus({ status });
      handleApiResponse(response, {
        onSuccess: (data) => {
          toast.success(data?.message || `Rates ${status}`);
          setShowRatesModal(false);
          setMerchantRates((prev) => (prev ? { ...prev, status } : prev));
        },
        onError: (message) => {
          toast.error(message || `Failed to update rates status to ${status}`);
        },
        silent: true,
      });
    } catch (error) {
      console.error('Update rates status error:', error);
      toast.error('Unexpected error while updating rates status');
    } finally {
      setActioningRate(false);
    }
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForAPI = (date: Date | undefined): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
  };

  // Fetch dashboard data
  const fetchDashboard = async (from: string, to: string) => {
    setDashboardLoading(true);
    try {
      const response = await getMerchantDashboard(from, to);
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res?.success && res.data) {
            setDashboardData(res.data);
          } else {
            setDashboardData(null);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch dashboard:', errorMessage);
          toast.error(errorMessage || 'Failed to load dashboard data');
          setDashboardData(null);
        },
        silent: true,
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      toast.error('Unexpected error while loading dashboard data');
      setDashboardData(null);
    } finally {
      setDashboardLoading(false);
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

  // Use API data or fallback to defaults
  const stats = useMemo(() => {
    if (!dashboardData?.transactionStatistics) {
      return {
        successfulTransactions: 0,
        declineCount: 0,
        chargebackCount: 0,
        refundCount: 0,
        successPercentage: 0,
        declinePercentage: 0,
        chargebackPercentage: 0,
        refundPercentage: 0,
        // Placeholder values for stats not in API
        totalCards: 0,
        activeRisks: 0,
        openTickets: 0,
      };
    }
    return {
      successfulTransactions: dashboardData.transactionStatistics.successCount,
      declineCount: dashboardData.transactionStatistics.declineCount,
      chargebackCount: dashboardData.transactionStatistics.chargebackCount,
      refundCount: dashboardData.transactionStatistics.refundCount,
      successPercentage: dashboardData.transactionStatistics.successPercentage,
      declinePercentage: dashboardData.transactionStatistics.declinePercentage,
      chargebackPercentage: dashboardData.transactionStatistics.chargebackPercentage,
      refundPercentage: dashboardData.transactionStatistics.refundPercentage,
      // Placeholder values for stats not in API (can be fetched from other endpoints later)
      totalCards: 0,
      activeRisks: 0,
      openTickets: 0,
    };
  }, [dashboardData]);

  // Chart data for transaction statistics
  const transactionChartData = useMemo(() => {
    if (!dashboardData?.transactionStatistics) return null;

    const stats = dashboardData.transactionStatistics;
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
  }, [dashboardData]);

  // Transaction volume trend over time (from connectorTransactionsSummary grouped by date)
  const transactionVolumeTrendData = useMemo(() => {
    if (!dashboardData?.connectorTransactionsSummary || !Array.isArray(dashboardData.connectorTransactionsSummary)) return null;
    
    // Check if data is grouped by date (has 'date' field)
    const firstItem = dashboardData.connectorTransactionsSummary[0];
    if (!firstItem || !('date' in firstItem)) return null;

    // Group by date and sum amounts
    const dateMap = new Map<string, { count: number; amount: number }>();
    
    dashboardData.connectorTransactionsSummary.forEach((item: any) => {
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
  }, [dashboardData]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Check if onboarding should be shown
  // Show if profileStep is 0 (start onboarding) or > 0 (resume onboarding)
  // Hide if onboarding is completed (profileStep >= 4 and kycStatus === 'approved')
  const profileStep = onboardingData?.user?.profileStep ?? 0;
  const kycStatus = onboardingData?.user?.kycStatus;
  const isCompleted = profileStep >= 4 && kycStatus === 'approved';
  const showOnboarding = !isCompleted && onboardingData !== null;

  return (
    <Fragment>
      <Dialog open={showRatesModal} onOpenChange={() => {}}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Merchant Rates Pending Approval</DialogTitle>
            <DialogDescription>
              Please review and approve or reject the rates to continue.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            {merchantRates ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Default MDR</span>
                  <span className="font-medium">{merchantRates.defaultMdr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Visa MDR</span>
                  <span className="font-medium">{merchantRates.visaMdr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Master MDR</span>
                  <span className="font-medium">{merchantRates.masterMdr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rolling Reserve</span>
                  <span className="font-medium">{merchantRates.rollingReserve}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Success Tx Fee</span>
                  <span className="font-medium">{merchantRates.successTransactionFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Declined Tx Fee</span>
                  <span className="font-medium">{merchantRates.declinedTransactionFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chargeback Fee</span>
                  <span className="font-medium">{merchantRates.chargebackFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Flagged Fee</span>
                  <span className="font-medium">{merchantRates.flaggedFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Setup Fee</span>
                  <span className="font-medium">{merchantRates.setupFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Refund Fee</span>
                  <span className="font-medium">{merchantRates.refundFee}</span>
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">No rate data available.</div>
            )}
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="destructive"
              onClick={() => handleRatesStatusChange('rejected')}
              disabled={actioningRate || ratesLoading}
            >
              {actioningRate ? 'Rejecting...' : 'Reject'}
            </Button>
            <Button
              variant="primary"
              onClick={() => handleRatesStatusChange('approved')}
              disabled={actioningRate || ratesLoading}
            >
              {actioningRate ? 'Approving...' : 'Approve'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Banner - Show if 2FA is not enabled */}
      {showTwoFaBanner && (
        <div className="mb-5 lg:mb-7.5">
          <TwoFaBanner show={true} />
        </div>
      )}

      
      {/* Onboarding Card - Show if profileStep is 0 (start) or > 0 (resume) */}
      {showOnboarding && (
        <div className="mb-5 lg:mb-7.5">
          <OnboardingCard 
            onboardingData={onboardingData} 
            loading={onboardingLoading}
          />
        </div>
      )}

      {dashboardLoading ? (
        <div className="mt-5 flex items-center justify-center py-20 lg:mt-7.5">
          <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
      ) : (
        <>
          <div className="relative mt-5 overflow-hidden rounded-2xl border border-sky-200/70 bg-[linear-gradient(135deg,#f0f9ff_0%,#ffffff_45%,#e0f2fe_100%)] p-5 sm:p-6 dark:border-sky-900/50 dark:bg-[linear-gradient(135deg,#0c1a24_0%,#0f172a_50%,#082f49_100%)] lg:mt-7.5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-700/80 dark:text-sky-300/80">
              Merchant pulse
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Home Hub snapshot
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Live payment outcomes and workspace health for the selected period.
            </p>
          </div>

          <div className="mt-5 lg:mt-7.5">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              <h3 className="text-sm font-semibold text-foreground">Money Flow</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-sky-100 border-l-4 border-l-emerald-500 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Approved</p>
                  <CheckCircle2 className="size-4 text-emerald-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{stats.successfulTransactions.toLocaleString()}</p>
                <Badge variant="success" appearance="light" size="sm" className="mt-2 text-xs">
                  {stats.successPercentage.toFixed(1)}% success rate
                </Badge>
              </div>
              <div className="rounded-2xl border border-sky-100 border-l-4 border-l-red-500 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Declined</p>
                  <TrendingDown className="size-4 text-red-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{stats.declineCount.toLocaleString()}</p>
                <Badge variant="destructive" appearance="light" size="sm" className="mt-2 text-xs">
                  {stats.declinePercentage?.toFixed(1) || '0.0'}% decline rate
                </Badge>
              </div>
              <div className="rounded-2xl border border-sky-100 border-l-4 border-l-amber-500 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Chargebacks</p>
                  <XCircle className="size-4 text-amber-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{stats.chargebackCount.toLocaleString()}</p>
                <Badge variant="warning" appearance="light" size="sm" className="mt-2 text-xs">
                  {stats.chargebackPercentage?.toFixed(1) || '0.0'}% chargeback rate
                </Badge>
              </div>
              <div className="rounded-2xl border border-sky-100 border-l-4 border-l-sky-500 bg-card p-4 shadow-sm dark:border-sky-900/40">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Refunds</p>
                  <RefreshCw className="size-4 text-sky-500" />
                </div>
                <p className="mt-3 text-3xl font-bold tracking-tight">{stats.refundCount.toLocaleString()}</p>
                <Badge variant="info" appearance="light" size="sm" className="mt-2 text-xs">
                  {stats.refundPercentage?.toFixed(1) || '0.0'}% refund rate
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:mt-7.5">
            {transactionChartData && (
              <Card className="overflow-hidden rounded-2xl border-sky-100 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
                <CardHeader className="border-b border-sky-100/80 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20">
                  <CardTitle className="text-base font-semibold">Status Mix</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    How your payments split across outcomes
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
        </>
      )}

      <div className="mt-5 lg:mt-7.5">
        <div className="mb-3 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
          <h3 className="text-sm font-semibold text-foreground">Workspace Signals</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-card p-4 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Safe Cards</p>
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <CreditCard className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{stats.totalCards}</p>
            <p className="mt-1 text-xs text-muted-foreground">Cards in whitelist</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-card p-4 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Risk Rules</p>
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                <Shield className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{stats.activeRisks}</p>
            <p className="mt-1 text-xs text-muted-foreground">Risk rules configured</p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-card p-4 shadow-sm ring-1 ring-sky-500/5 dark:border-sky-900/40">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Open Cases</p>
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600">
                <Ticket className="size-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight">{stats.openTickets}</p>
            <p className="mt-1 text-xs text-muted-foreground">Support tickets</p>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

