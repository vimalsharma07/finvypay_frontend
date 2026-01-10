'use client';

import { Fragment, useEffect, useState, useMemo } from 'react';
import { UserCheck } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { getOnboardingStatus, OnboardingData, InitializeOnboardingPayload } from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { StepIndicator } from './components/step-indicator';
import { Step1KycType } from './components/step-1-kyc-type';
import { Step2BasicDetails } from './components/step-2-basic-details';
import { Step3ProcessingDetails } from './components/step-3-processing-details';
import { Step4Directors } from './components/step-4-directors';
import { Step5VideoKyc } from './components/step-5-video-kyc';
import { Step6Agreement } from './components/step-6-agreement';
import { StepCompleted } from './components/step-completed';
import {
  UpdateBasicDetailsPayload,
  UpdateProcessingDetailsPayload,
} from '@/lib/services/user/onboarding';

/**
 * User Onboarding Page
 * 
 * Multi-step onboarding process for user profile verification
 */
export default function OnboardingPage() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [kycType, setKycType] = useState<InitializeOnboardingPayload['kycType'] | null>(null);

  // Determine if directors step should be shown
  const shouldShowDirectorsStep = useMemo(() => {
    const kycType = onboardingData?.kycType || onboardingData?.onboarding?.kycType;
    return kycType && kycType !== 'individual';
  }, [onboardingData]);

  // Define onboarding steps dynamically based on kycType
  const steps = useMemo(() => {
    const baseSteps = [
      {
        number: 1,
        title: 'Account Type',
        subtitle: 'Setup Your Account Details',
      },
      {
        number: 2,
        title: 'Account Settings',
        subtitle: 'Setup Your Account Settings',
      },
      {
        number: 3,
        title: 'Business Info',
        subtitle: 'Your Business Related Info',
      },
    ];

    // Add Directors step for company/partnership
    if (shouldShowDirectorsStep) {
      baseSteps.push({
        number: 4,
        title: 'Directors',
        subtitle: 'Add Directors Information',
      });
      baseSteps.push({
        number: 5,
        title: 'Video KYC',
        subtitle: 'Record Your Verification Video',
      });
      baseSteps.push({
        number: 6,
        title: 'Agreement',
        subtitle: 'Sign the Agreement',
      });
    } else {
      baseSteps.push({
        number: 4,
        title: 'Video KYC',
        subtitle: 'Record Your Verification Video',
      });
      baseSteps.push({
        number: 5,
        title: 'Agreement',
        subtitle: 'Sign the Agreement',
      });
    }

    baseSteps.push({
      number: shouldShowDirectorsStep ? 7 : 6,
      title: 'Completed',
      subtitle: 'Woah, we are here',
    });

    return baseSteps;
  }, [shouldShowDirectorsStep]);

  // Fetch onboarding status on mount
  useEffect(() => {
    const fetchOnboarding = async () => {
      setLoading(true);
      try {
        const response = await getOnboardingStatus();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setOnboardingData(data.data);
              const profileStep = data.data.user?.profileStep ?? 0;
              const kycStatus = data.data.user?.kycStatus;
              
              // If status is pending_for_approval, show completed step
              if (kycStatus === 'pending_for_approval') {
                const kycType = data.data.kycType || data.data.onboarding?.kycType;
                const needsDirectorsStep = kycType && kycType !== 'individual';
                const finalStep = needsDirectorsStep ? 7 : 6;
                setCurrentStep(finalStep);
              } else {
                // Determine current step based on profileStep
                if (profileStep === 0) {
                  setCurrentStep(1);
                } else if (profileStep >= 1 && profileStep < 5) {
                  setCurrentStep(profileStep + 1);
                } else {
                  setCurrentStep(5);
                }
              }

              // Set kycType if available
              if (data.data.user?.entityType) {
                setKycType(data.data.user.entityType as InitializeOnboardingPayload['kycType']);
              }
            }
          },
          onError: (errorMessage) => {
            console.error('Failed to fetch onboarding status:', errorMessage);
          },
        });
      } catch (error) {
        console.error('Onboarding fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboarding();
  }, []);

  const handleKycTypeUpdate = async (data: InitializeOnboardingPayload) => {
    setKycType(data.kycType);
    // Update onboarding data optimistically
    setOnboardingData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        onboarding: prev.onboarding
          ? { ...prev.onboarding, kycType: data.kycType }
          : prev.onboarding,
        kycType: data.kycType,
        user: {
          ...prev.user,
          profileStep: 1,
          entityType: data.kycType,
        },
      };
    });
    // Refresh onboarding data from server to get latest state
    try {
      const response = await getOnboardingStatus();
      handleApiResponse(response, {
        onSuccess: (responseData) => {
          if (responseData && responseData.success && responseData.data) {
            setOnboardingData(responseData.data);
            // Ensure we're on step 2 after successful update
            setCurrentStep(2);
          }
        },
      });
    } catch (error) {
      console.error('Failed to refresh onboarding data:', error);
      // Still advance to step 2 even if refresh fails
      setCurrentStep(2);
    }
  };

  const handleBasicDetailsUpdate = (data: UpdateBasicDetailsPayload) => {
    // Update onboarding data optimistically
    if (onboardingData) {
      setOnboardingData({
        ...onboardingData,
        user: {
          ...onboardingData.user,
          profileStep: 2,
        },
      });
    }
  };

  const handleProcessingDetailsUpdate = (data: UpdateProcessingDetailsPayload) => {
    // Update onboarding data optimistically
    if (onboardingData) {
      setOnboardingData({
        ...onboardingData,
        user: {
          ...onboardingData.user,
          profileStep: 3,
        },
      });
    }
  };

  const handleDirectorsUpdate = () => {
    // Refresh onboarding data after directors update
    // The step progression will be handled by the component
  };

  const handleVideoKycUpdate = async () => {
    // Refresh onboarding data from server to get latest state
    try {
      const response = await getOnboardingStatus();
      handleApiResponse(response, {
        onSuccess: (responseData) => {
          if (responseData && responseData.success && responseData.data) {
            setOnboardingData(responseData.data);
            // Determine next step based on whether directors step is shown
            // Recalculate shouldShowDirectorsStep from fresh data
            const kycType = responseData.data?.kycType || responseData.data?.onboarding?.kycType;
            const needsDirectorsStep = kycType && kycType !== 'individual';
            const nextStep = needsDirectorsStep ? 6 : 5; // Agreement step
            setCurrentStep(nextStep);
          }
        },
      });
    } catch (error) {
      console.error('Failed to refresh onboarding data:', error);
      // Still advance to next step even if refresh fails
      const nextStep = shouldShowDirectorsStep ? 6 : 5;
      setCurrentStep(nextStep);
    }
  };

  const handleAgreementUpdate = () => {
    // Refresh onboarding data after agreement update
    // The step progression will be handled by the component
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (loading) {
    return (
      <Fragment>
        <Container>
          <Toolbar>
            <ToolbarHeading
              title="Onboarding"
              description="Complete your merchant profile verification with business information, documents, and compliance requirements"
              icon={UserCheck}
            />
          </Toolbar>
        </Container>
        <Container>
          <div className="text-center py-12">Loading...</div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Onboarding"
            description="Complete your merchant profile verification with business information, documents, and compliance requirements to get started"
            icon={UserCheck}
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step Indicator - Left Side */}
          <div className="lg:col-span-1">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Content - Right Side */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Step1KycType
                onNext={handleNext}
                onUpdate={handleKycTypeUpdate}
              />
            )}
            {currentStep === 2 && onboardingData && (
              <Step2BasicDetails
                onboardingData={onboardingData}
                onNext={handleNext}
                onUpdate={handleBasicDetailsUpdate}
              />
            )}
            {currentStep === 3 && onboardingData && (
              <Step3ProcessingDetails
                onboardingData={onboardingData}
                onNext={handleNext}
                onUpdate={handleProcessingDetailsUpdate}
              />
            )}
            {currentStep === 4 && onboardingData && shouldShowDirectorsStep && (
              <Step4Directors
                onboardingData={onboardingData}
                onNext={handleNext}
                onUpdate={handleDirectorsUpdate}
              />
            )}
            {currentStep === 4 && onboardingData && !shouldShowDirectorsStep && (
              <Step5VideoKyc
                onboardingData={onboardingData}
                onNext={handleNext}
                onUpdate={handleVideoKycUpdate}
              />
            )}
            {currentStep === 5 && onboardingData && shouldShowDirectorsStep && (
              <Step5VideoKyc
                onboardingData={onboardingData}
                onNext={handleNext}
                onUpdate={handleVideoKycUpdate}
              />
            )}
            {currentStep === 5 && onboardingData && !shouldShowDirectorsStep && (
              <Step6Agreement
                onboardingData={onboardingData}
                onNext={handleNext}
                onUpdate={handleAgreementUpdate}
              />
            )}
            {currentStep === 6 && onboardingData && shouldShowDirectorsStep && (
              <Step6Agreement
                onboardingData={onboardingData}
                onNext={handleNext}
                onUpdate={handleAgreementUpdate}
              />
            )}
            {currentStep === 6 && !shouldShowDirectorsStep && (
              <StepCompleted
                onboardingData={onboardingData}
                onRefresh={async () => {
                  const response = await getOnboardingStatus();
                  handleApiResponse(response, {
                    onSuccess: (data) => {
                      if (data && data.success && data.data) {
                        setOnboardingData(data.data);
                      }
                    },
                  });
                }}
              />
            )}
            {currentStep === 7 && shouldShowDirectorsStep && (
              <StepCompleted
                onboardingData={onboardingData}
                onRefresh={async () => {
                  const response = await getOnboardingStatus();
                  handleApiResponse(response, {
                    onSuccess: (data) => {
                      if (data && data.success && data.data) {
                        setOnboardingData(data.data);
                      }
                    },
                  });
                }}
              />
            )}
            {currentStep > 7 && (
              <div className="text-center py-12 text-muted-foreground">
                Step {currentStep} - Coming soon
              </div>
            )}
          </div>
        </div>
      </Container>
    </Fragment>
  );
}

