'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { getAffiliateOnboardingStatus } from '@/lib/services/affiliate/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { Step1Details } from './components/step-1-details';
import { Step2Agreement } from './components/step-2-agreement';
import { StepIndicator } from '@/app/(protected)/(merchant)/onboarding/components/step-indicator';

const AFFILIATE_STEPS = [
  { number: 1, title: 'Details & documents', subtitle: 'Submit your details and POI, POA' },
  { number: 2, title: 'Agreement', subtitle: 'Sign the RP Agreement' },
  { number: 3, title: 'Completed', subtitle: 'You\'re all set' },
];

export default function AffiliateOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [affiliateName, setAffiliateName] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await getAffiliateOnboardingStatus();
        handleApiResponse(res, {
          onSuccess: (data) => {
            if (cancelled || !data?.data) return;
            const status = data.data;
            const isCompleted =
              status.status === 'completed' ||
              status.currentStep >= status.totalSteps;
            if (isCompleted) {
              router.replace('/affiliate/dashboard');
              return;
            }
            setCurrentStep(status.currentStep);
          },
          onError: () => setCurrentStep(1),
          silent: true,
        });
      } catch {
        setCurrentStep(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleStep1Next = (name?: string) => {
    if (name) setAffiliateName(name);
    setCurrentStep(2);
  };
  const handleStep2Next = () => {
    router.replace('/affiliate/dashboard');
  };

  if (loading) {
    return (
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Affiliate onboarding"
            description="Complete your KYC"
            icon={UserCheck}
          />
        </Toolbar>
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Affiliate onboarding"
          description="Complete your details and sign the agreement"
          icon={UserCheck}
        />
      </Toolbar>

      <Container>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step Indicator - Left Side */}
          <div className="lg:col-span-1">
            <StepIndicator steps={AFFILIATE_STEPS} currentStep={currentStep} />
          </div>

          {/* Step Content - Right Side */}
          <div className="lg:col-span-2">
            {currentStep === 1 && <Step1Details onNext={handleStep1Next} />}
            {currentStep === 2 && (
              <Step2Agreement affiliateName={affiliateName} onNext={handleStep2Next} />
            )}
            {currentStep === 3 && (
              <div className="text-center py-12 text-muted-foreground">
                Onboarding complete. Redirecting to dashboard...
              </div>
            )}
          </div>
        </div>
      </Container>
    </Container>
  );
}
