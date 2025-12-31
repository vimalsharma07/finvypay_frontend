'use client';

import { Fragment, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  ArrowRight,
  Shield,
  Ticket,
  BarChart3
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

  // TODO: Replace with actual API data
  const stats = {
    totalTransactions: 1250,
    totalAmount: 125000.50,
    pendingTransactions: 45,
    successfulTransactions: 1205,
    failedTransactions: 0,
    totalCards: 12,
    activeRisks: 3,
    openTickets: 2,
  };

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

      {/* Stats Grid */}
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-4 mt-5 lg:mt-7.5">
        {/* Total Transactions */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
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
            <div className="flex items-center gap-1.5">
              <Badge variant="success" appearance="light" size="sm" className="text-xs">
                <TrendingUp className="h-3 w-3" />
                All time
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card className="relative overflow-hidden border-[var(--color-info-alpha,var(--color-violet-200))]/30 bg-gradient-to-br from-[var(--color-info-soft,var(--color-violet-50))] to-[var(--color-info-soft,var(--color-violet-100))] dark:from-[var(--color-info-soft,var(--color-violet-950))] dark:to-[var(--color-info-soft,var(--color-violet-900))] shadow-md shadow-[var(--color-info-accent,var(--color-violet-500))]/10 hover:shadow-lg hover:shadow-[var(--color-info-accent,var(--color-violet-500))]/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-info-accent,var(--color-violet-500))]/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <DollarSign className="h-32 w-32 text-[var(--color-info-accent,var(--color-violet-600))]" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
              <span className="flex-1">Total Amount</span>
              <div className="p-2 rounded-lg bg-[var(--color-info-accent,var(--color-violet-500))]/10 flex items-center justify-center shrink-0">
                <DollarSign className="h-5 w-5 text-[var(--color-info-accent,var(--color-violet-600))]" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-2">{formatCurrency(stats.totalAmount)}</div>
            <div className="flex items-center gap-1.5">
              <Badge variant="info" appearance="light" size="sm" className="text-xs">
                <TrendingUp className="h-3 w-3" />
                Processed
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Successful Transactions */}
        <Card className="relative overflow-hidden border-[var(--color-success-alpha,var(--color-green-200))]/30 bg-gradient-to-br from-[var(--color-success-soft,var(--color-green-50))] to-[var(--color-success-soft,var(--color-green-100))] dark:from-[var(--color-success-soft,var(--color-green-950))] dark:to-[var(--color-success-soft,var(--color-green-900))] shadow-md shadow-[var(--color-success-accent,var(--color-green-500))]/10 hover:shadow-lg hover:shadow-[var(--color-success-accent,var(--color-green-500))]/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-success-accent,var(--color-green-500))]/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <CheckCircle2 className="h-32 w-32 text-[var(--color-success-accent,var(--color-green-600))]" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
              <span className="flex-1">Successful</span>
              <div className="p-2 rounded-lg bg-[var(--color-success-accent,var(--color-green-500))]/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5 text-[var(--color-success-accent,var(--color-green-600))]" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-2">{stats.successfulTransactions.toLocaleString()}</div>
            <div className="flex items-center gap-2">
              <Badge variant="success" appearance="light" size="sm" className="text-xs">
                {((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)}% success rate
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Pending Transactions */}
        <Card className="relative overflow-hidden border-[var(--color-warning-alpha,var(--color-yellow-200))]/30 bg-gradient-to-br from-[var(--color-warning-soft,var(--color-yellow-50))] to-[var(--color-warning-soft,var(--color-yellow-100))] dark:from-[var(--color-warning-soft,var(--color-yellow-950))] dark:to-[var(--color-warning-soft,var(--color-yellow-900))] shadow-md shadow-[var(--color-warning-accent,var(--color-yellow-500))]/10 hover:shadow-lg hover:shadow-[var(--color-warning-accent,var(--color-yellow-500))]/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[var(--color-warning-accent,var(--color-yellow-500))]/10 rounded-full -mr-10 -mt-10 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <Clock className="h-32 w-32 text-[var(--color-warning-accent,var(--color-yellow-600))]" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium text-foreground flex items-center justify-between w-full">
              <span className="flex-1">Pending</span>
              <div className="p-2 rounded-lg bg-[var(--color-warning-accent,var(--color-yellow-500))]/10 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-[var(--color-warning-accent,var(--color-yellow-600))]" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold mb-2">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-3 mt-5 lg:mt-7.5">
        {/* Trusted Cards */}
        <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 group">
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
        <Card className="relative overflow-hidden border-[var(--color-warning-alpha,var(--color-yellow-200))]/30 bg-gradient-to-br from-[var(--color-warning-soft,var(--color-yellow-50))] to-[var(--color-warning-soft,var(--color-yellow-100))] dark:from-[var(--color-warning-soft,var(--color-yellow-950))] dark:to-[var(--color-warning-soft,var(--color-yellow-900))] shadow-md shadow-[var(--color-warning-accent,var(--color-yellow-500))]/10 hover:shadow-lg hover:shadow-[var(--color-warning-accent,var(--color-yellow-500))]/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-warning-accent,var(--color-yellow-500))]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <Shield className="h-32 w-32 text-[var(--color-warning-accent,var(--color-yellow-600))]" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[var(--color-warning-accent,var(--color-yellow-500))]/10 group-hover:bg-[var(--color-warning-accent,var(--color-yellow-500))]/20 transition-colors">
                <Shield className="h-4 w-4 text-[var(--color-warning-accent,var(--color-yellow-600))]" />
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
        <Card className="relative overflow-hidden border-[var(--color-info-alpha,var(--color-violet-200))]/30 bg-gradient-to-br from-[var(--color-info-soft,var(--color-violet-50))] to-[var(--color-info-soft,var(--color-violet-100))] dark:from-[var(--color-info-soft,var(--color-violet-950))] dark:to-[var(--color-info-soft,var(--color-violet-900))] shadow-md shadow-[var(--color-info-accent,var(--color-violet-500))]/10 hover:shadow-lg hover:shadow-[var(--color-info-accent,var(--color-violet-500))]/20 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-info-accent,var(--color-violet-500))]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
          <div className="absolute bottom-0 right-0 opacity-10">
            <Ticket className="h-32 w-32 text-[var(--color-info-accent,var(--color-violet-600))]" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-medium flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[var(--color-info-accent,var(--color-violet-500))]/10 group-hover:bg-[var(--color-info-accent,var(--color-violet-500))]/20 transition-colors">
                <Ticket className="h-4 w-4 text-[var(--color-info-accent,var(--color-violet-600))]" />
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
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/user/transactions"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-primary/20 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent hover:border-primary/50 hover:from-primary/10 hover:via-primary/5 hover:to-primary/3 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all shadow-sm">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-primary group-hover:text-primary/90 transition-colors">View Transactions</div>
                <div className="text-xs text-muted-foreground group-hover:text-foreground/70 transition-colors">See all transactions</div>
              </div>
              <ArrowRight className="h-4 w-4 text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all relative z-10" />
            </a>
            <a
              href="/user/risk-compliance/trusted-cards"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-[var(--color-info-alpha,var(--color-violet-200))]/30 bg-gradient-to-br from-[var(--color-info-soft,var(--color-violet-50))]/50 via-[var(--color-info-soft,var(--color-violet-50))]/30 to-transparent hover:border-[var(--color-info-accent,var(--color-violet-500))]/50 hover:from-[var(--color-info-soft,var(--color-violet-50))] hover:via-[var(--color-info-soft,var(--color-violet-50))]/50 hover:to-[var(--color-info-soft,var(--color-violet-50))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-info-accent,var(--color-violet-500))]/20"
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--color-info-accent,var(--color-violet-500))]/20 to-[var(--color-info-accent,var(--color-violet-500))]/10 group-hover:from-[var(--color-info-accent,var(--color-violet-500))]/30 group-hover:to-[var(--color-info-accent,var(--color-violet-500))]/20 transition-all shadow-sm">
                <CreditCard className="h-6 w-6 text-[var(--color-info-accent,var(--color-violet-600))]" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-[var(--color-info-accent,var(--color-violet-700))] group-hover:text-[var(--color-info-accent,var(--color-violet-600))] transition-colors">Manage Cards</div>
                <div className="text-xs text-muted-foreground group-hover:text-[var(--color-info-accent,var(--color-violet-600))]/70 transition-colors">Trusted cards</div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--color-info-accent,var(--color-violet-500))]/60 group-hover:text-[var(--color-info-accent,var(--color-violet-600))] group-hover:translate-x-1 transition-all relative z-10" />
            </a>
            <a
              href="/user/risk-compliance/manage-risk"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-[var(--color-warning-alpha,var(--color-yellow-200))]/30 bg-gradient-to-br from-[var(--color-warning-soft,var(--color-yellow-50))]/50 via-[var(--color-warning-soft,var(--color-yellow-50))]/30 to-transparent hover:border-[var(--color-warning-accent,var(--color-yellow-500))]/50 hover:from-[var(--color-warning-soft,var(--color-yellow-50))] hover:via-[var(--color-warning-soft,var(--color-yellow-50))]/50 hover:to-[var(--color-warning-soft,var(--color-yellow-50))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-warning-accent,var(--color-yellow-500))]/20"
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--color-warning-accent,var(--color-yellow-500))]/20 to-[var(--color-warning-accent,var(--color-yellow-500))]/10 group-hover:from-[var(--color-warning-accent,var(--color-yellow-500))]/30 group-hover:to-[var(--color-warning-accent,var(--color-yellow-500))]/20 transition-all shadow-sm">
                <Shield className="h-6 w-6 text-[var(--color-warning-accent,var(--color-yellow-600))]" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-[var(--color-warning-accent,var(--color-yellow-700))] group-hover:text-[var(--color-warning-accent,var(--color-yellow-600))] transition-colors">Risk Management</div>
                <div className="text-xs text-muted-foreground group-hover:text-[var(--color-warning-accent,var(--color-yellow-600))]/70 transition-colors">Configure risks</div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--color-warning-accent,var(--color-yellow-500))]/60 group-hover:text-[var(--color-warning-accent,var(--color-yellow-600))] group-hover:translate-x-1 transition-all relative z-10" />
            </a>
            <a
              href="/user/support"
              className="group relative flex items-center gap-4 p-4 border-2 rounded-xl border-[var(--color-success-alpha,var(--color-green-200))]/30 bg-gradient-to-br from-[var(--color-success-soft,var(--color-green-50))]/50 via-[var(--color-success-soft,var(--color-green-50))]/30 to-transparent hover:border-[var(--color-success-accent,var(--color-green-500))]/50 hover:from-[var(--color-success-soft,var(--color-green-50))] hover:via-[var(--color-success-soft,var(--color-green-50))]/50 hover:to-[var(--color-success-soft,var(--color-green-50))]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[var(--color-success-accent,var(--color-green-500))]/20"
            >
              <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--color-success-accent,var(--color-green-500))]/20 to-[var(--color-success-accent,var(--color-green-500))]/10 group-hover:from-[var(--color-success-accent,var(--color-green-500))]/30 group-hover:to-[var(--color-success-accent,var(--color-green-500))]/20 transition-all shadow-sm">
                <Ticket className="h-6 w-6 text-[var(--color-success-accent,var(--color-green-600))]" />
              </div>
              <div className="flex-1 relative z-10">
                <div className="font-semibold text-sm mb-1 text-[var(--color-success-accent,var(--color-green-700))] group-hover:text-[var(--color-success-accent,var(--color-green-600))] transition-colors">Support</div>
                <div className="text-xs text-muted-foreground group-hover:text-[var(--color-success-accent,var(--color-green-600))]/70 transition-colors">View tickets</div>
              </div>
              <ArrowRight className="h-4 w-4 text-[var(--color-success-accent,var(--color-green-500))]/60 group-hover:text-[var(--color-success-accent,var(--color-green-600))] group-hover:translate-x-1 transition-all relative z-10" />
            </a>
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
}

