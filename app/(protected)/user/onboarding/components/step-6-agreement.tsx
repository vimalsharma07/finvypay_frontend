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
import { CheckCircle2, FileText } from 'lucide-react';

interface Step6AgreementProps {
  onboardingData: OnboardingData;
  onNext: () => void;
  onUpdate?: () => void;
}

export function Step6Agreement({ onboardingData, onNext, onUpdate }: Step6AgreementProps) {
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
    toast.success('Signature captured successfully');
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
      handleApiResponse(response, {
        onSuccess: (responseData) => {
          if (responseData && responseData.success) {
            toast.success('Agreement signed and uploaded successfully');
            setHasUploaded(true);
            refreshOnboardingData();
            onUpdate?.();
          }
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to upload signed agreement');
        },
        onValidationError: (errors, messages) => {
          const errorMsg = Array.isArray(messages) ? messages.join(', ') : messages;
          toast.error(errorMsg || 'Validation error');
        },
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Upload signature error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUploadSuccess = async () => {
    await refreshOnboardingData();
    onUpdate?.();
  };

  const handleContinue = () => {
    if (!hasUploaded) {
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
        {hasUploaded && onboardingData?.onboarding?.signedAgreement ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">Agreement Signed</p>
                <p className="text-sm text-muted-foreground">
                  Your agreement has been successfully signed and uploaded.
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
          <div className="space-y-6">
            {/* Agreement Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">{agreement.name}</h3>
              </div>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {agreement.desc}
                </div>
              </ScrollArea>
            </div>

            {/* Signature Pad */}
            {canSign && (
              <div className="space-y-4">
                <h4 className="font-medium">Electronic Signature</h4>
                <SignaturePad
                  onSignatureComplete={handleSignatureComplete}
                  disabled={isUploading || hasUploaded}
                />
                
                {signatureDataUrl && (
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleUploadSignature}
                      disabled={isUploading || hasUploaded}
                    >
                      {isUploading ? 'Uploading...' : 'Upload Signed Agreement'}
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
                disabled={hasUploaded || isUploading}
              />
            </div>

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

