'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SignaturePad } from './signature-pad';
import { FileUploadCard } from './file-upload-card';
import {
  getAgreement,
  signAgreement,
  getOnboardingStatus,
  OnboardingData,
  Agreement,
} from '@/lib/services/user/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { CheckCircle2, FileText, ChevronRight, ChevronLeft } from 'lucide-react';

interface Step6AgreementProps {
  onboardingData: OnboardingData;
  onNext: () => void;
  onBack: () => void;
  onUpdate?: () => void;
}

export function Step6Agreement({ onboardingData, onNext, onBack, onUpdate }: Step6AgreementProps) {
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [canSign, setCanSign] = useState(false);
  const [loading, setLoading] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  // Check if agreement is already signed
  useEffect(() => {
    const signedAgreementPath = onboardingData?.onboarding?.signedAgreement;
    if (signedAgreementPath) {
      setHasUploaded(true);
    }
  }, [onboardingData]);

  // Fetch agreement on mount
  useEffect(() => {
    fetchAgreement();
  }, []);

  const fetchAgreement = async () => {
    setLoading(true);
    try {
      const response = await getAgreement('user');
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data) {
            setAgreement(data.data.agreement);
            setCanSign(data.data.canSign);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch agreement:', errorMessage);
          toast.error(errorMessage || 'Failed to load agreement');
        },
      });
    } catch (error) {
      console.error('Agreement fetch error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshOnboardingData = async () => {
    try {
      const response = await getOnboardingStatus();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.success && data.data?.onboarding?.signedAgreement) {
            setHasUploaded(true);
          }
        },
      });
    } catch (error) {
      console.error('Failed to refresh onboarding data:', error);
    }
  };

  const handleSignatureComplete = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  };

  const handleSignatureClear = () => {
    setSignatureDataUrl(null);
  };

  const convertDataUrlToFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  const handleUploadSignature = async () => {
    if (!signatureDataUrl) {
      toast.error('Please sign the agreement first');
      return;
    }

    setIsUploading(true);
    try {
      // Convert signature data URL to File
      const signatureFile = convertDataUrlToFile(signatureDataUrl, 'signature.png');
      
      const response = await signAgreement(signatureFile);
      
      // Check if upload was successful based on response status
      if (response.status === 200) {
        // Immediately set uploaded state to enable Next button
        setHasUploaded(true);
        setIsUploading(false); // Set uploading to false immediately
        
        toast.success('Agreement signed and uploaded successfully');
        
        // Refresh onboarding data in background (non-blocking)
        refreshOnboardingData().catch((error) => {
          console.error('Failed to refresh onboarding data:', error);
        });
        // Don't auto-redirect, let user click Next button manually
      } else {
        // Handle error response
        handleApiResponse(response, {
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to upload signed agreement');
          },
          onValidationError: (errors, messages) => {
            const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
            toast.error(errorMsg || 'Validation error');
          },
        });
        setIsUploading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Upload signature error:', error);
      setIsUploading(false);
    }
  };

  const handleFileUploadSuccess = async () => {
    setHasUploaded(true);
    // Refresh onboarding data in background (non-blocking)
    refreshOnboardingData().catch((error) => {
      console.error('Failed to refresh onboarding data:', error);
    });
    // Don't auto-redirect, let user click Next button manually
  };

  // Check if signature is uploaded - use both local state and server data
  const isSignatureUploaded = hasUploaded || !!onboardingData?.onboarding?.signedAgreement;

  const handleNext = () => {
    if (!isSignatureUploaded) {
      toast.error('Please sign and upload the agreement first');
      return;
    }
    onNext();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">Loading agreement...</div>
        </CardContent>
      </Card>
    );
  }

  if (!agreement) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Agreement not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agreement & Signature</CardTitle>
        <CardDescription>
          Please read and sign the agreement to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Agreement Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{agreement.name}</h3>
            </div>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {agreement.desc}
              </div>
            </ScrollArea>
          </div>

          {/* Success Message */}
          {isSignatureUploaded && (
            <div className="flex items-center gap-1 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">Agreement Signed</p>
                <p className="text-sm text-muted-foreground">
                  Your agreement has been successfully signed and uploaded.
                </p>
              </div>
            </div>
          )}

          {/* Signature Pad */}
          {canSign && (
            <div className="space-y-4">
              <h4 className="font-medium">Electronic Signature</h4>
              <SignaturePad
                onSignatureComplete={handleSignatureComplete}
                onSignatureClear={handleSignatureClear}
                disabled={isUploading || isSignatureUploaded}
              />
              
              {/* Upload Signature Button - Show when signature is captured */}
              {signatureDataUrl && !isSignatureUploaded && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleUploadSignature}
                    disabled={isUploading || isSignatureUploaded}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Signature'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Alternative: File Upload */}
          <div className="space-y-4">
            <h4 className="font-medium">Or Upload Signed Agreement Document</h4>
            <FileUploadCard
              type="signed_agreement"
              label="Signed Agreement Document"
              description="Upload your signed agreement document (PDF, DOC, DOCX)"
              required={!signatureDataUrl}
              onUploadSuccess={handleFileUploadSuccess}
              disabled={isSignatureUploaded || isUploading}
            />
          </div>

          {/* Back and Continue Buttons - At bottom */}
          <div className="flex justify-between pt-4 border-t">
            <Button type="button" variant="outline" onClick={onBack} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleNext}
              disabled={!isSignatureUploaded || isUploading}
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

