'use client';

import { useState, useEffect, useMemo } from 'react';
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

  const personalizedAgreementHtml = useMemo(() => {
    if (!agreement) return '';

    const customerName = onboardingData?.onboarding?.name;
    if (!customerName) return agreement.desc;

    return agreement.desc.replace(/\{name\}/g, customerName);
  }, [agreement, onboardingData]);

  if (loading) {
    return (
      <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
        <CardContent className="pt-6">
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 py-8 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            Loading agreement...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!agreement) {
    return (
      <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
        <CardContent className="pt-6">
          <div className="rounded-xl border border-sky-100 bg-sky-50/40 py-8 text-center text-muted-foreground dark:border-sky-900/40 dark:bg-sky-950/20">
            Agreement not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-sky-100 shadow-sm dark:border-sky-900/40">
      <CardHeader className="border-b border-sky-100/80 bg-sky-50/40 dark:border-sky-900/40 dark:bg-sky-950/20">
        <CardTitle>Sign Off</CardTitle>
        <CardDescription>
          Review the agreement and add your signature to finish setup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                <FileText className="h-4 w-4" />
              </div>
              <h3 className="text-lg font-semibold">{agreement.name}</h3>
            </div>
            <ScrollArea className="h-[300px] w-full rounded-xl border border-sky-100 p-4 dark:border-sky-900/40">
              <div
                className="whitespace-pre-wrap text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: personalizedAgreementHtml }}
              />
            </ScrollArea>
          </div>

          {isSignatureUploaded && (
            <div className="flex items-center gap-3 rounded-xl border border-success/20 bg-success/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <div>
                <p className="font-medium text-success">Agreement signed</p>
                <p className="text-sm text-muted-foreground">
                  Your signed agreement has been uploaded.
                </p>
              </div>
            </div>
          )}

          {canSign && (
            <div className="space-y-4">
              <h4 className="font-medium">Electronic Signature</h4>
              <SignaturePad
                onSignatureComplete={handleSignatureComplete}
                onSignatureClear={handleSignatureClear}
                disabled={isUploading || isSignatureUploaded}
              />
              
              {signatureDataUrl && !isSignatureUploaded && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleUploadSignature}
                    disabled={isUploading || isSignatureUploaded}
                    className="rounded-xl shadow-sm shadow-sky-500/20"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Signature'}
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-medium">Or upload a signed agreement document</h4>
            <FileUploadCard
              type="signed_agreement"
              label="Signed Agreement Document"
              description="Upload your signed agreement document (PDF, DOC, DOCX)"
              required={!signatureDataUrl}
              onUploadSuccess={handleFileUploadSuccess}
              disabled={isSignatureUploaded || isUploading}
            />
          </div>

          <div className="flex justify-between border-t border-sky-100 pt-4 dark:border-sky-900/40">
            <Button type="button" variant="outline" onClick={onBack} className="gap-2 rounded-xl">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button 
              type="button" 
              variant="primary" 
              onClick={handleNext}
              disabled={!isSignatureUploaded || isUploading}
              className="gap-2 rounded-xl shadow-sm shadow-sky-500/20"
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

