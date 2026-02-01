'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import { format, startOfYear, endOfYear } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  Shield,
  Ticket,
  BarChart3,
  XCircle,
  RefreshCw,
  CalendarDays,
  Loader2,
} from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
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

/**
 * User Dashboard Content Component
 * 
 * Displays user-specific dashboard widgets and statistics
 */
export function UserDashboardContent() {
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    // Default to current year
    const today = new Date();
    return {
      from: startOfYear(today),
      to: endOfYear(today),
    };
  });
  const [tempDateRange, setTempDateRange] = useState<DateRange | undefined>(dateRange);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

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
    const resetRange = {
      from: startOfYear(today),
      to: endOfYear(today),
    };
    setTempDateRange(resetRange);
    setDateRange(resetRange);
    setIsDatePickerOpen(false);
  };

  // Use API data or fallback to defaults
  const stats = useMemo(() => {
    if (!dashboardData?.transactionStatistics) {
      return {
        totalTransactions: 0,
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
      totalTransactions: dashboardData.transactionStatistics.totalTransactions,
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

      {/* Date Range Filter */}
      <div className="flex items-center justify-end mt-5 lg:mt-7.5">
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
              defaultMonth={tempDateRange?.from}
              selected={tempDateRange}
              onSelect={setTempDateRange}
              numberOfMonths={1}
            />
            <div className="flex items-center justify-end gap-2 border-t p-3">
              <Button variant="outline" size="sm" onClick={handleDateRangeReset}>
                Reset
              </Button>
              <Button size="sm" onClick={handleDateRangeApply}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Stats Grid */}
      {dashboardLoading ? (
        <div className="flex items-center justify-center py-20 mt-5 lg:mt-7.5">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-4 mt-5 lg:mt-7.5">
        {/* Total Transactions */}
        <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <Activity className="h-32 w-32 text-primary" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
              <span className="flex-1">Total Transactions</span>
              <div className="p-2 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Activity className="h-5 w-5 text-primary" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-2">{stats.totalTransactions.toLocaleString()}</div>
            <div className="flex items-center gap-1">
              <Badge variant="success" appearance="light" size="sm" className="text-xs">
                <TrendingUp className="h-3 w-3" />
                Total transactions
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Successful Transactions */}
        <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/30 dark:via-emerald-950/30 dark:to-teal-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-linear-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-green-700 dark:text-green-300">Success</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 group-hover:bg-green-200 dark:group-hover:bg-green-900/70 transition-colors duration-300">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
              {stats.successfulTransactions.toLocaleString()}
            </div>
            <p className="text-xs text-green-600/70 dark:text-green-300/70 font-medium">
              {stats.successPercentage.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        {/* Declined Transactions */}
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
              {stats.declineCount.toLocaleString()}
            </div>
            <p className="text-xs text-red-600/70 dark:text-red-300/70 font-medium">
              {stats.declinePercentage?.toFixed(1) || '0.0'}% decline rate
            </p>
          </CardContent>
        </Card>

        {/* Chargebacks */}
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
              {stats.chargebackCount.toLocaleString()}
            </div>
            <p className="text-xs text-amber-600/70 dark:text-amber-300/70 font-medium">
              {stats.chargebackPercentage?.toFixed(1) || '0.0'}% chargeback rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Transaction Stats - Refunds */}
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-2 mt-5 lg:mt-7.5">
        <Card className="group relative overflow-hidden border-0 bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950/30 dark:via-indigo-950/30 dark:to-purple-950/30 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-700 dark:text-blue-300">Refunds</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70 transition-colors duration-300">
              <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 group-hover:rotate-180 transition-transform duration-300" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1 group-hover:scale-105 transition-transform duration-300 inline-block">
              {stats.refundCount.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600/70 dark:text-blue-300/70 font-medium">
              {stats.refundPercentage?.toFixed(1) || '0.0'}% refund rate
            </p>
          </CardContent>
        </Card>
      </div>
      </>
      )}

      {/* Secondary Stats Grid */}
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-3 mt-5 lg:mt-7.5">
        {/* Trusted Cards */}
        <Card className="relative overflow-hidden border-primary/20 bg-linear-to-br from-primary/5 to-primary/10 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <CreditCard className="h-32 w-32 text-primary" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              Trusted Cards
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-1">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground">
              Cards in whitelist
            </p>
          </CardContent>
        </Card>

        {/* Active Risks */}
        <Card className="relative overflow-hidden border-(--color-warning-alpha,var(--color-yellow-200))/30 bg-linear-to-br from-(--color-warning-soft,var(--color-yellow-50)) to-(--color-warning-soft,var(--color-yellow-100)) dark:from-(--color-warning-soft,var(--color-yellow-950)) dark:to-(--color-warning-soft,var(--color-yellow-900)) shadow-md shadow-(--color-warning-accent,var(--color-yellow-500))/10 hover:shadow-lg hover:shadow-(--color-warning-accent,var(--color-yellow-500))/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-(--color-warning-accent,var(--color-yellow-500))/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <Shield className="h-32 w-32 text-(--color-warning-accent,var(--color-yellow-600))" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-(--color-warning-accent,var(--color-yellow-500))/10 group-hover:bg-(--color-warning-accent,var(--color-yellow-500))/20 transition-colors">
                <Shield className="h-4 w-4 text-(--color-warning-accent,var(--color-yellow-600))" />
              </div>
              Active Risks
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-1">{stats.activeRisks}</div>
            <p className="text-xs text-muted-foreground">
              Risk rules configured
            </p>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card className="relative overflow-hidden border-(--color-info-alpha,var(--color-violet-200))/30 bg-linear-to-br from-(--color-info-soft,var(--color-violet-50)) to-(--color-info-soft,var(--color-violet-100)) dark:from-(--color-info-soft,var(--color-violet-950)) dark:to-(--color-info-soft,var(--color-violet-900)) shadow-md shadow-(--color-info-accent,var(--color-violet-500))/10 hover:shadow-lg hover:shadow-(--color-info-accent,var(--color-violet-500))/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-(--color-info-accent,var(--color-violet-500))/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <Ticket className="h-32 w-32 text-(--color-info-accent,var(--color-violet-600))" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-(--color-info-accent,var(--color-violet-500))/10 group-hover:bg-(--color-info-accent,var(--color-violet-500))/20 transition-colors">
                <Ticket className="h-4 w-4 text-(--color-info-accent,var(--color-violet-600))" />
              </div>
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-1">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Support tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-5 lg:mt-7.5">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-1">
            <div className="p-2 rounded-lg bg-linear-to-br from-primary/20 to-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/transactions"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-primary/20 bg-linear-to-br from-primary/5 via-primary/3 to-transparent hover:border-primary/50 hover:from-primary/10 hover:via-primary/5 hover:to-primary/3 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <div className="p-3 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-sm">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-primary group-hover:text-primary/90 transition-colors">View Transactions</div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">See all transactions</div>
              </div>
              <ArrowRight className="h-4 w-4 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all relative z-10" />
            </a>
            <a
              href="/risk-compliance/trusted-cards"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-(--color-info-alpha,var(--color-violet-200))/30 bg-linear-to-br from-(--color-info-soft,var(--color-violet-50))/50 via-(--color-info-soft,var(--color-violet-50))/30 to-transparent hover:border-(--color-info-accent,var(--color-violet-500))/50 hover:from-(--color-info-soft,var(--color-violet-50)) hover:via-(--color-info-soft,var(--color-violet-50))/50 hover:to-(--color-info-soft,var(--color-violet-50))/30 transition-all duration-300 hover:shadow-lg hover:shadow-(--color-info-accent,var(--color-violet-500))/20"
            >
              <div className="p-3 rounded-lg bg-linear-to-br from-(--color-info-accent,var(--color-violet-500))/20 to-(--color-info-accent,var(--color-violet-500))/10 group-hover:from-(--color-info-accent,var(--color-violet-500))/30 group-hover:to-(--color-info-accent,var(--color-violet-500))/20 transition-all shadow-sm">
                <CreditCard className="h-6 w-6 text-(--color-info-accent,var(--color-violet-600))" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-(--color-info-accent,var(--color-violet-700)) group-hover:text-(--color-info-accent,var(--color-violet-600)) transition-colors">Manage Cards</div>
                <div className="text-xs text-muted-foreground group-hover:text-(--color-info-accent,var(--color-violet-600))/70 transition-colors">Trusted cards</div>
              </div>
              <ArrowRight className="h-4 w-4 text-(--color-info-accent,var(--color-violet-500))/60 group-hover:text-(--color-info-accent,var(--color-violet-600)) group-hover:translate-x-1 transition-all relative z-10" />
            </a>
            <a
              href="/risk-compliance/manage-risk"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-(--color-warning-alpha,var(--color-yellow-200))/30 bg-linear-to-br from-(--color-warning-soft,var(--color-yellow-50))/50 via-(--color-warning-soft,var(--color-yellow-50))/30 to-transparent hover:border-(--color-warning-accent,var(--color-yellow-500))/50 hover:from-(--color-warning-soft,var(--color-yellow-50)) hover:via-(--color-warning-soft,var(--color-yellow-50))/50 hover:to-(--color-warning-soft,var(--color-yellow-50))/30 transition-all duration-300 hover:shadow-lg hover:shadow-(--color-warning-accent,var(--color-yellow-500))/20"
            >
              <div className="p-3 rounded-lg bg-linear-to-br from-(--color-warning-accent,var(--color-yellow-500))/20 to-(--color-warning-accent,var(--color-yellow-500))/10 group-hover:from-(--color-warning-accent,var(--color-yellow-500))/30 group-hover:to-(--color-warning-accent,var(--color-yellow-500))/20 transition-all shadow-sm">
                <Shield className="h-6 w-6 text-(--color-warning-accent,var(--color-yellow-600))" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-(--color-warning-accent,var(--color-yellow-700)) group-hover:text-(--color-warning-accent,var(--color-yellow-600)) transition-colors">Risk Management</div>
                <div className="text-xs text-muted-foreground group-hover:text-(--color-warning-accent,var(--color-yellow-600))/70 transition-colors">Configure risks</div>
              </div>
              <ArrowRight className="h-4 w-4 text-(--color-warning-accent,var(--color-yellow-500))/60 group-hover:text-(--color-warning-accent,var(--color-yellow-600)) group-hover:translate-x-1 transition-all relative z-10" />
            </a>
            <a
              href="/support"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-(--color-success-alpha,var(--color-green-200))/30 bg-linear-to-br from-(--color-success-soft,var(--color-green-50))/50 via-(--color-success-soft,var(--color-green-50))/30 to-transparent hover:border-(--color-success-accent,var(--color-green-500))/50 hover:from-(--color-success-soft,var(--color-green-50)) hover:via-(--color-success-soft,var(--color-green-50))/50 hover:to-(--color-success-soft,var(--color-green-50))/30 transition-all duration-300 hover:shadow-lg hover:shadow-(--color-success-accent,var(--color-green-500))/20"
            >
              <div className="p-3 rounded-lg bg-linear-to-br from-(--color-success-accent,var(--color-green-500))/20 to-(--color-success-accent,var(--color-green-500))/10 group-hover:from-(--color-success-accent,var(--color-green-500))/30 group-hover:to-(--color-success-accent,var(--color-green-500))/20 transition-all shadow-sm">
                <Ticket className="h-6 w-6 text-(--color-success-accent,var(--color-green-600))" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-(--color-success-accent,var(--color-green-700)) group-hover:text-(--color-success-accent,var(--color-green-600)) transition-colors">Support</div>
                <div className="text-xs text-muted-foreground group-hover:text-(--color-success-accent,var(--color-green-600))/70 transition-colors">View tickets</div>
              </div>
              <ArrowRight className="h-4 w-4 text-(--color-success-accent,var(--color-green-500))/60 group-hover:text-(--color-success-accent,var(--color-green-600)) group-hover:translate-x-1 transition-all relative z-10" />
            </a>
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
}

