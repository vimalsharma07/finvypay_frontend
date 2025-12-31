'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { enableTwoFa, toggleTwoFa } from '@/lib/services/user/two-fa';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

export function TwoFaSetup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState(false);

  const fetchQrCode = async () => {
    setLoading(true);
    setError(null);
    setQrCodeUrl(null);
    setSecret(null);
    setMessage(null);
    setToken('');

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

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit code from your authenticator app');
      return;
    }

    if (!secret) {
      setError('Secret is missing. Please regenerate the QR code.');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const response = await toggleTwoFa({
        enable: true,
        secret: secret,
        token: token,
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success) {
            setIsEnabled(true);
            toast.success(data.message || 'Two-Factor Authentication enabled successfully');
            // Update localStorage to reflect 2FA is now enabled
            if (typeof window !== 'undefined') {
              try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                  const userData = JSON.parse(storedUser);
                  userData.isTwoFaEnabled = true;
                  localStorage.setItem('user', JSON.stringify(userData));
                }
              } catch (err) {
                console.error('Failed to update user data:', err);
              }
            }
            // Refresh the page after a short delay to update the UI
            setTimeout(() => {
              router.refresh();
            }, 1500);
          }
        },
        onError: (errorMessage) => {
          setError(errorMessage || 'Failed to verify code. Please try again.');
          toast.error(errorMessage || 'Verification failed');
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  // Removed auto-generation on mount - user will click button to generate QR code

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

        {!loading && qrCodeUrl && message && !isEnabled && (
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
                    <li>Enter the 6-digit code from your app below to complete setup</li>
                  </ol>
                </div>
              </div>

              {/* Verification Input */}
              <div className="w-full max-w-md space-y-3 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="token" className="text-sm font-medium">
                    Enter 6-digit code from your authenticator app
                  </Label>
                  <Input
                    id="token"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={token}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                      setToken(value);
                      setError(null); // Clear error when user types
                    }}
                    placeholder="000000"
                    className="text-center text-2xl font-mono tracking-widest"
                    disabled={verifying}
                  />
                  {error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <Button
                  onClick={handleVerify}
                  disabled={verifying || token.length !== 6}
                  className="w-full"
                  variant="primary"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Enable 2FA'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <Button onClick={fetchQrCode} variant="outline" disabled={verifying}>
                Regenerate QR Code
              </Button>
            </div>
          </div>
        )}

        {isEnabled && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Two-Factor Authentication has been successfully enabled! Your account is now more secure.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {!loading && !qrCodeUrl && !error && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="text-center space-y-4 max-w-md">
              <p className="text-sm text-muted-foreground">
                Click the button below to generate a QR code for setting up Two-Factor Authentication.
              </p>
              <Button onClick={fetchQrCode} variant="primary" size="lg">
                Generate QR Code
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

