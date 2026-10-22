'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getOnboardingStatus, OnboardingData } from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StepCompletedProps {
  onboardingData: OnboardingData | null;
  onRefresh?: () => void;
}

export function StepCompleted({ onboardingData, onRefresh }: StepCompletedProps) {
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (kycStatus === 'agreement_received' || kycStatus === 'pending_for_approval') {
        fetchStatus();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [kycStatus]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await getOnboardingStatus();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data?.user?.kycStatus) {
            setKycStatus(data.data.user.kycStatus);
            onRefresh?.();
          } else if (data && data.success && data.data?.onboarding) {
            const status = data.data.user?.kycStatus || null;
            setKycStatus(status);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch onboarding status:', errorMessage);
        },
      });
    } catch (error) {
      console.error('Status fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (onboardingData?.user?.kycStatus) {
      setKycStatus(onboardingData.user.kycStatus);
      setLoading(false);
    }
  }, [onboardingData]);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
        <CardContent className="pt-6">
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 py-8 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            Loading status...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (kycStatus === 'agreement_received' || kycStatus === 'pending_for_approval') {
    return (
      <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
        <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
          <CardTitle>You&apos;re in</CardTitle>
          <CardDescription>
            Your application is with our review team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border border-sky-200/80 bg-sky-50/60 p-6 dark:border-sky-800 dark:bg-sky-950/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Pending approval</h3>
                <p className="text-sm text-muted-foreground">
                  Your onboarding application was submitted successfully and is under review.
                  We&apos;ll notify you once the review is complete.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  This page refreshes automatically for status updates.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={fetchStatus}
                disabled={loading}
                className="rounded-xl"
              >
                Refresh Status
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleGoToDashboard}
                className="rounded-xl shadow-sm shadow-sky-500/20"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (kycStatus === 'approved' || kycStatus === 'active') {
    return (
      <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
        <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
          <CardTitle>Congratulations</CardTitle>
          <CardDescription>
            Your merchant account is verified and ready
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border border-success/20 bg-success/10 p-6">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Setup complete</h3>
                <p className="text-sm text-muted-foreground">
                  Your account has been approved. You can now use the full merchant workspace.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleGoToDashboard}
                className="min-w-[200px] rounded-xl shadow-sm shadow-sky-500/20"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (kycStatus === 'rejected' || kycStatus === 'declined') {
    return (
      <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
        <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
          <CardTitle>Application review</CardTitle>
          <CardDescription>
            Your application needs attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4 rounded-xl border border-destructive/20 bg-destructive/10 p-6">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-destructive" />
              <div className="flex-1 space-y-2">
                <h3 className="text-lg font-semibold">Status update</h3>
                <p className="text-sm text-muted-foreground">
                  Your onboarding application has been reviewed. Please contact support for
                  more information.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleGoToDashboard}
                className="min-w-[200px] rounded-xl shadow-sm shadow-sky-500/20"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
      <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
        <CardTitle>You&apos;re in</CardTitle>
        <CardDescription>
          All setup steps are complete
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start gap-4 rounded-xl border border-success/20 bg-success/10 p-6">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-success" />
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-semibold">Application submitted</h3>
              <p className="text-sm text-muted-foreground">
                You finished every onboarding step. We&apos;ll notify you once review is done.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              type="button"
              variant="primary"
              onClick={handleGoToDashboard}
              className="min-w-[200px] rounded-xl shadow-sm shadow-sky-500/20"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
