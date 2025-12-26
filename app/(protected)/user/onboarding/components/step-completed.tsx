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
    // Refresh status every 30 seconds if waiting for approval
    const interval = setInterval(() => {
      if (kycStatus === 'agreement_received') {
        fetchStatus();
      }
    }, 30000); // 30 seconds

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
            // Fallback to check onboarding data
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

  // Get status from props if available
  useEffect(() => {
    if (onboardingData?.user?.kycStatus) {
      setKycStatus(onboardingData.user.kycStatus);
      setLoading(false);
    }
  }, [onboardingData]);

  const handleGoToDashboard = () => {
    router.push('/user/dashboard');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">Loading status...</div>
        </CardContent>
      </Card>
    );
  }

  // Check if waiting for admin approval
  if (kycStatus === 'agreement_received') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Waiting for Approval</CardTitle>
          <CardDescription>
            Your onboarding application is under review
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-info/10 border border-info/20 rounded-lg">
              <Clock className="h-6 w-6 text-info mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">Application Submitted</h3>
                <p className="text-sm text-muted-foreground">
                  Your onboarding application has been successfully submitted and is currently 
                  under review by our admin team. We will notify you once the review is complete.
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  This page will automatically refresh to check for status updates.
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={fetchStatus}
                disabled={loading}
              >
                Refresh Status
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleGoToDashboard}
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if approved
  if (kycStatus === 'approved' || kycStatus === 'active') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Congratulations!</CardTitle>
          <CardDescription>
            Your onboarding has been completed and approved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">Onboarding Complete</h3>
                <p className="text-sm text-muted-foreground">
                  Your account has been successfully verified and approved. You can now access 
                  all features of the platform.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="primary"
                onClick={handleGoToDashboard}
                className="min-w-[200px]"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if rejected
  if (kycStatus === 'rejected' || kycStatus === 'declined') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Application Review</CardTitle>
          <CardDescription>
            Your application requires attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-6 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-6 w-6 text-destructive mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-lg">Application Status</h3>
                <p className="text-sm text-muted-foreground">
                  Your onboarding application has been reviewed. Please contact support for 
                  more information about your application status.
                </p>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="primary"
                onClick={handleGoToDashboard}
                className="min-w-[200px]"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default completion message
  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Complete</CardTitle>
        <CardDescription>
          All steps have been completed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 bg-success/10 border border-success/20 rounded-lg">
            <CheckCircle2 className="h-6 w-6 text-success mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-lg">Congratulations!</h3>
              <p className="text-sm text-muted-foreground">
                You have successfully completed all onboarding steps. Your application is 
                being processed and you will be notified once it's reviewed.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              type="button"
              variant="primary"
              onClick={handleGoToDashboard}
              className="min-w-[200px]"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

