'use client';

import { useState } from 'react';
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
import { CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';

interface Step5VideoKycProps {
  onboardingData: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onUpdate?: () => void;
}

export function Step5VideoKyc({ onboardingData, onNext, onBack, onUpdate }: Step5VideoKycProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<Blob | null>(null);

  // Remove auto-advance, let user click Next button manually

  const handleVideoRecorded = (videoBlob: Blob) => {
    setRecordedVideo(videoBlob);
    setHasUploaded(false);
  };

  const handleUpload = async (videoFile: File) => {
    setIsUploading(true);
    try {
      const response = await uploadFile(videoFile, 'video_kyc');
      
      // Check if upload was successful based on response status
      if (response.status === 200) {
        // Immediately set uploaded state to enable Next button
        setHasUploaded(true);
        setIsUploading(false); // Set uploading to false immediately
        
        toast.success('Video KYC uploaded successfully');
        
        // Refresh onboarding data in background (non-blocking)
        refreshOnboardingData().catch((error) => {
          console.error('Failed to refresh onboarding data:', error);
        });
      } else {
        // Handle error response
        handleApiResponse(response, {
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to upload video KYC');
            setHasUploaded(false);
          },
          onValidationError: (errors, messages) => {
            const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
            toast.error(errorMsg || 'Validation error');
            setHasUploaded(false);
          },
        });
        setIsUploading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Video upload error:', error);
      setHasUploaded(false);
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

  // Check if video is uploaded - only use local state to keep button disabled by default
  const isVideoUploaded = hasUploaded;

  const handleNext = () => {
    if (!isVideoUploaded) {
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
        <div className="space-y-4">
          {isVideoUploaded && (
            <div className="flex items-center gap-1 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">Video KYC Completed</p>
                <p className="text-sm text-muted-foreground">
                  Your video has been successfully uploaded and verified.
                </p>
              </div>
            </div>
          )}
          
          <VideoRecorder
            onVideoRecorded={handleVideoRecorded}
            onUpload={handleUpload}
            isUploading={isUploading}
            maxDuration={4}
          />
          
          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleNext}
              disabled={!isVideoUploaded || isUploading}
              className="gap-2"
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

