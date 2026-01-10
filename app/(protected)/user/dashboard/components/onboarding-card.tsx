'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, CheckCircle2, Clock, AlertCircle, Rocket, Sparkles } from 'lucide-react';
import { OnboardingData } from '@/lib/services/user/onboarding';
import Link from 'next/link';

interface OnboardingCardProps {
  onboardingData: OnboardingData | null;
  loading?: boolean;
}

export function OnboardingCard({ onboardingData, loading = false }: OnboardingCardProps) {
  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!onboardingData) {
    return null;
  }

  const { user } = onboardingData;
  const profileStep = user?.profileStep ?? 0;
  const isStarted = profileStep > 0;
  const kycStatus = user?.kycStatus;

  // Don't show if onboarding is completed and approved
  if (profileStep >= 4 && kycStatus === 'approved') {
    return null;
  }

  // Show pending approval status
  if (kycStatus === 'agreement_received' || kycStatus === 'pending_for_approval') {
    return (
      <Card className="border-warning/30 bg-gradient-to-r from-warning/10 via-warning/5 to-warning/10 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-12 w-12 rounded-full bg-warning/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Pending for Admin Approval
                </h3>
                <Badge variant="warning" className="text-xs font-medium">
                  Under Review
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Your onboarding application has been successfully submitted and is currently 
                under review by our admin team. We will notify you once the review is complete.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <Link href="/user/onboarding">
                    View Status
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <span className="text-xs text-muted-foreground">
                  Status will update automatically
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show rejected/declined status
  if (kycStatus === 'rejected' || kycStatus === 'declined') {
    return (
      <Card className="border-destructive/30 bg-gradient-to-r from-destructive/10 via-destructive/5 to-destructive/10 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="h-12 w-12 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Application Requires Attention
                </h3>
                <Badge variant="destructive" className="text-xs font-medium">
                  Action Required
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Your onboarding application has been reviewed. Please contact support for 
                more information about your application status.
              </p>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <Link href="/user/onboarding">
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  asChild
                >
                  <Link href="/user/support">
                    Contact Support
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Regular onboarding card (incomplete or in progress)
  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6 flex-1">
            {!isStarted && (
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shadow-lg shadow-primary/20">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {isStarted ? 'Complete Your Profile Verification' : 'Welcome! Let\'s Get Started'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isStarted 
                  ? 'Continue your onboarding process to complete your profile verification and unlock all features.'
                  : 'Complete your profile verification to start processing transactions and access all features.'
                }
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button 
              variant="primary" 
              size="lg"
              className="gap-2"
              asChild
            >
              <Link href="/user/onboarding">
                <Rocket className="h-4 w-4" />
                {isStarted ? 'Resume Onboarding' : 'Start Onboarding'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
