'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Rocket, Sparkles } from 'lucide-react';
import Link from 'next/link';
import type { AffiliateOnboardingStatusData } from '@/lib/services/affiliate/onboarding';

interface AffiliateOnboardingCardProps {
  statusData: AffiliateOnboardingStatusData | null;
  loading?: boolean;
}

/**
 * Shown on affiliate dashboard when KYC/onboarding is not completed.
 * Matches merchant dashboard pattern: "Your KYC not complete" + "Complete KYC" button.
 */
export function AffiliateOnboardingCard({
  statusData,
  loading = false,
}: AffiliateOnboardingCardProps) {
  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (!statusData) {
    return null;
  }

  const isCompleted =
    statusData.status === 'completed' ||
    statusData.currentStep >= statusData.totalSteps;

  if (isCompleted) {
    return null;
  }

  const isStarted = statusData.currentStep > 0;

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
                {isStarted
                  ? 'Complete Your KYC Verification'
                  : 'Your KYC is not complete'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {statusData.message ||
                  (isStarted
                    ? 'Continue your onboarding to complete KYC and unlock all features.'
                    : 'Complete your KYC to start referring merchants and access all features.')}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button variant="primary" size="lg" className="gap-2" asChild>
              <Link href="/affiliate/onboarding">
                <Rocket className="h-4 w-4" />
                {isStarted ? 'Resume KYC' : 'Complete KYC'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
