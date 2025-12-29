'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoRecorder } from './video-recorder';
import {
  uploadFile,
  getOnboardingStatus,
  OnboardingData,
} from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface Step5VideoKycProps {
  onboardingData: OnboardingData;
  onNext: () => void;
  onUpdate?: () => void;
}

export function Step5VideoKyc({ onboardingData, onNext, onUpdate }: Step5VideoKycProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);

  // Check if video KYC is already completed
  useEffect(() => {
    const videoKycPath = onboardingData?.onboarding?.videoKycPath;
    if (videoKycPath) {
      setHasUploaded(true);
    }
  }, [onboardingData]);

  // Auto-advance to next step after successful upload (with small delay for UI feedback)
  useEffect(() => {
    if (hasUploaded && onboardingData?.onboarding?.videoKycPath && onUpdate) {
      // Small delay to show success message before advancing
      const timer = setTimeout(() => {
        onUpdate();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasUploaded, onboardingData?.onboarding?.videoKycPath, onUpdate]);

  const handleVideoRecorded = (videoBlob: Blob) => {
    setRecordedVideo(videoBlob);
    setHasUploaded(false);
  };

  const handleUpload = async (videoFile: File) => {
    setIsUploading(true);
    try {
      const response = await uploadFile(videoFile, 'video_kyc');
      handleApiResponse(response, {
        onSuccess: async (data) => {
          if (data && data.success) {
            toast.success('Video KYC uploaded successfully');
            setHasUploaded(true);
            
            // Refresh onboarding data and advance to next step
            await refreshOnboardingData();
            // onUpdate will handle data refresh and step progression
            await onUpdate?.();
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to upload video KYC');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Video upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const refreshOnboardingData = async () => {
    try {
      const response = await getOnboardingStatus();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data?.onboarding?.videoKycPath) {
            setHasUploaded(true);
          }
        },
      });
    } catch (error) {
      console.error('Failed to refresh onboarding data:', error);
    }
  };

  const handleContinue = () => {
    if (!hasUploaded) {
      toast.error('Please upload the video KYC first');
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video KYC Verification</CardTitle>
        <CardDescription>
          Record a {4}-second video for identity verification
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasUploaded && onboardingData?.onboarding?.videoKycPath ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">Video KYC Completed</p>
                <p className="text-sm text-muted-foreground">
                  Your video has been successfully uploaded and verified.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="primary" onClick={handleContinue}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <VideoRecorder
              onVideoRecorded={handleVideoRecorded}
              onUpload={handleUpload}
              isUploading={isUploading}
              maxDuration={4}
            />
            {hasUploaded && (
              <div className="flex justify-end pt-4">
                <Button type="button" variant="primary" onClick={handleContinue}>
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

