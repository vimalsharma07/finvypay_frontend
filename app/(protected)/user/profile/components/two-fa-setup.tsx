'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { enableTwoFa } from '@/lib/services/user/two-fa';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

export function TwoFaSetup() {
  const [loading, setLoading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQrCode = async () => {
    setLoading(true);
    setError(null);
    setQrCodeUrl(null);
    setSecret(null);
    setMessage(null);

    try {
      const response = await enableTwoFa();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data?.data) {
            setQrCodeUrl(data.data.qrCodeUrl);
            setSecret(data.data.secret);
            setMessage(data.message || 'Two-Factor Authentication setup initiated. Scan the QR code with your authenticator app.');
            toast.success('QR code generated successfully');
          } else {
            setError('Failed to generate QR code. Please try again.');
          }
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Failed to generate QR code. Please try again.');
          toast.error(errorMessage || 'Failed to generate QR code');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Automatically fetch QR code when component mounts
    fetchQrCode();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Enable Two-Factor Authentication</CardTitle>
            <CardDescription>
              Secure your account with an extra layer of protection
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        )}

        {!loading && qrCodeUrl && message && (
          <div className="space-y-6">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>

            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border-2 border-border">
                <img 
                  src={qrCodeUrl} 
                  alt="2FA QR Code" 
                  className="w-64 h-64"
                />
              </div>
              
              {secret && (
                <div className="w-full max-w-md">
                  <p className="text-sm text-muted-foreground mb-2 text-center">
                    Can't scan? Enter this code manually:
                  </p>
                  <div className="p-3 bg-muted rounded-lg text-center">
                    <code className="text-sm font-mono break-all">{secret}</code>
                  </div>
                </div>
              )}

              <div className="w-full max-w-md space-y-3 pt-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)</li>
                    <li>Scan the QR code above or enter the secret code manually</li>
                    <li>Enter the 6-digit code from your app to complete setup</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={fetchQrCode} variant="outline">
                Regenerate QR Code
              </Button>
            </div>
          </div>
        )}

        {!loading && !qrCodeUrl && !error && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Button onClick={fetchQrCode} variant="primary">
              Generate QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

