'use client';

import { Fragment, useEffect, useState } from 'react';
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
  Activity
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
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-4">
        {/* Total Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                All time
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Total Amount */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-success flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Processed
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Successful Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        {/* Pending Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid gap-5 lg:gap-7.5 lg:grid-cols-3">
        {/* Trusted Cards */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Trusted Cards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCards}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Cards in whitelist
            </p>
          </CardContent>
        </Card>

        {/* Active Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Active Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeRisks}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Risk rules configured
            </p>
          </CardContent>
        </Card>

        {/* Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-info" />
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Support tickets
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <a
              href="/user/transactions"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium text-sm">View Transactions</div>
                <div className="text-xs text-muted-foreground">See all transactions</div>
              </div>
            </a>
            <a
              href="/user/risk-compliance/trusted-cards"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <CreditCard className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Manage Cards</div>
                <div className="text-xs text-muted-foreground">Trusted cards</div>
              </div>
            </a>
            <a
              href="/user/risk-compliance/manage-risk"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <AlertCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Risk Management</div>
                <div className="text-xs text-muted-foreground">Configure risks</div>
              </div>
            </a>
            <a
              href="/user/support"
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <AlertCircle className="h-5 w-5 text-primary" />
              <div>
                <div className="font-medium text-sm">Support</div>
                <div className="text-xs text-muted-foreground">View tickets</div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </Fragment>
  );
}

