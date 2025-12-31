'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle2, AlertCircle, Lock, Unlock } from 'lucide-react';
import { toggleTwoFa } from '@/lib/services/user/two-fa';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

interface TwoFaManageProps {
  isEnabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFaManage({ isEnabled, onStatusChange }: TwoFaManageProps) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleToggle = async (enable: boolean) => {
    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit code from your authenticator app');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await toggleTwoFa({
        enable: enable,
        token: token,
        // No secret needed when toggling existing 2FA
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success) {
            toast.success(data.message || `Two-Factor Authentication ${enable ? 'enabled' : 'disabled'} successfully`);
            
            // Update localStorage to reflect 2FA status
            if (typeof window !== 'undefined') {
              try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                  const userData = JSON.parse(storedUser);
                  userData.isTwoFaEnabled = enable;
                  // If disabling, keep twoFaToken (don't remove it)
                  // If enabling, ensure twoFaToken is preserved
                  localStorage.setItem('user', JSON.stringify(userData));
                }
              } catch (err) {
                console.error('Failed to update user data:', err);
              }
            }

            // Notify parent component
            if (onStatusChange) {
              onStatusChange(enable);
            }

            // Reset form
            setToken('');
            setShowTokenInput(false);
            
            // Refresh the page after a short delay to update the UI
            setTimeout(() => {
              router.refresh();
            }, 1500);
          }
        },
        onError: (errorMessage) => {
          setError(errorMessage || `Failed to ${enable ? 'enable' : 'disable'} Two-Factor Authentication. Please check your code and try again.`);
          toast.error(errorMessage || `Failed to ${enable ? 'enable' : 'disable'} 2FA`);
        },
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  if (!showTokenInput) {
    // Show different UI based on whether 2FA is enabled or disabled
    if (isEnabled) {
      // 2FA is enabled - show disable option
      return (
        <Card>
          <CardHeader className="my-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication Enabled</CardTitle>
                <CardDescription>
                  Your account is protected with two-factor authentication
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
              <AlertDescription className="text-amber-900 dark:text-amber-200">
                Two-factor authentication is currently enabled on your account. You can disable it by entering your authentication code below.
              </AlertDescription>
            </Alert>

            <Button
              variant="destructive"
              onClick={() => setShowTokenInput(true)}
              className="w-full"
            >
              <Unlock className="mr-2 h-4 w-4" />
              Disable 2FA
            </Button>
          </CardContent>
        </Card>
      );
    } else {
      // 2FA is disabled but has token - show re-enable option
      return (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle>Re-enable Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Your 2FA was previously set up. Re-enable it with your authenticator app.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Two-factor authentication is currently disabled. You can re-enable it by entering a code from your authenticator app. No need to scan a new QR code.
              </AlertDescription>
            </Alert>

            <Button
              variant="primary"
              onClick={() => setShowTokenInput(true)}
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Re-enable 2FA
            </Button>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-full ${isEnabled ? 'bg-destructive/10' : 'bg-primary/10'} flex items-center justify-center`}>
            {isEnabled ? (
              <Unlock className="h-5 w-5 text-destructive" />
            ) : (
              <Lock className="h-5 w-5 text-primary" />
            )}
          </div>
          <div>
            <CardTitle>{isEnabled ? 'Disable' : 'Re-enable'} Two-Factor Authentication</CardTitle>
            <CardDescription>
              Enter your 6-digit authentication code to {isEnabled ? 'disable' : 're-enable'} 2FA
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

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="2fa-token">6-Digit Authentication Code</Label>
            <Input
              id="2fa-token"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={token}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                setToken(value);
                setError(null);
              }}
              placeholder="000000"
              className="text-center text-xl font-mono tracking-widest"
              disabled={processing}
            />
            <p className="text-xs text-muted-foreground">
              Enter the 6-digit code from your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowTokenInput(false);
                setToken('');
                setError(null);
              }}
              disabled={processing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant={isEnabled ? "destructive" : "primary"}
              onClick={() => handleToggle(!isEnabled)}
              disabled={processing || token.length !== 6}
              className="flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEnabled ? 'Disabling...' : 'Enabling...'}
                </>
              ) : (
                <>
                  {isEnabled ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Disable 2FA
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Re-enable 2FA
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

