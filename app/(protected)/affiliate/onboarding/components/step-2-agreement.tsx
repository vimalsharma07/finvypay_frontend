'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, ChevronRight, CheckCircle2 } from 'lucide-react';
import { getAgreement } from '@/lib/services/user/onboarding';
import { submitAffiliateOnboardingStep2 } from '@/lib/services/affiliate/onboarding';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { SignaturePad } from '@/app/(protected)/(merchant)/onboarding/components/signature-pad';

function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

interface Step2AgreementProps {
  onNext: () => void;
}

export function Step2Agreement({ onNext }: Step2AgreementProps) {
  const [agreement, setAgreement] = useState<{
    id: string;
    name: string;
    type: string;
    desc: string;
    status: string;
  } | null>(null);
  const [canSign, setCanSign] = useState(true);
  const [loading, setLoading] = useState(true);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await getAgreement('affiliate');
        handleApiResponse(response, {
          onSuccess: (body: { success?: boolean; data?: { agreement?: typeof agreement; canSign?: boolean } }) => {
            if (cancelled || !body?.data) return;
            const payload = body.data;
            if (payload.agreement) setAgreement(payload.agreement);
            if (typeof payload.canSign === 'boolean') setCanSign(payload.canSign);
          },
          onError: (msg) => toast.error(msg || 'Failed to load agreement'),
          silent: true,
        });
      } catch {
        toast.error('Failed to load agreement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignatureComplete = (dataUrl: string) => {
    setSignatureDataUrl(dataUrl);
  };

  const handleSignatureClear = () => {
    setSignatureDataUrl(null);
  };

  const handleUploadSignature = async () => {
    if (!signatureDataUrl) {
      toast.error('Please sign the agreement first');
      return;
    }
    setIsUploading(true);
    try {
      const file = dataUrlToFile(signatureDataUrl, 'signature.png');
      const response = await submitAffiliateOnboardingStep2(file);
      handleApiResponse(response, {
        onSuccess: () => {
          setHasUploaded(true);
          setIsUploading(false);
          toast.success('Agreement signed and uploaded successfully');
        },
        onError: (msg) => {
          toast.error(msg || 'Failed to upload signed agreement');
          setIsUploading(false);
        },
        onValidationError: (_, messages) => {
          toast.error(Array.isArray(messages) ? messages.join(', ') : 'Validation error');
          setIsUploading(false);
        },
      });
    } catch {
      toast.error('An unexpected error occurred');
      setIsUploading(false);
    }
  };

  const handleContinue = () => {
    if (!hasUploaded) {
      toast.error('Please sign and upload the agreement first');
      return;
    }
    onNext();
  };

  const agreementHtml = useMemo(
    () => (agreement?.desc ?? ''),
    [agreement]
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            Loading agreement...
          </div>
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
              <div
                className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: agreementHtml }}
              />
            </ScrollArea>
          </div>

          {/* Success Message */}
          {hasUploaded && (
            <div className="flex items-center gap-1 p-4 bg-success/10 border border-success/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div>
                <p className="font-medium text-success">Agreement Signed</p>
                <p className="text-sm text-muted-foreground">
                  Your agreement has been successfully signed and uploaded.
                </p>
              </div>
            </div>
          )}

          {/* Electronic Signature - always show so affiliate can sign online like user/merchant side */}
          <div className="space-y-4">
            <h4 className="font-medium">Electronic Signature</h4>
            <SignaturePad
              onSignatureComplete={handleSignatureComplete}
              onSignatureClear={handleSignatureClear}
              disabled={isUploading || hasUploaded}
            />
            {signatureDataUrl && !hasUploaded && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleUploadSignature}
                  disabled={isUploading || hasUploaded}
                >
                  {isUploading ? 'Uploading...' : 'Upload Signature'}
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="button"
              variant="primary"
              onClick={handleContinue}
              disabled={!hasUploaded || isUploading}
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
