'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, Lock, Ban, Award, Heart } from 'lucide-react';
import { enableTwoFa, toggleTwoFa } from '@/lib/services/user/two-fa';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

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
  const [copied, setCopied] = useState(false);

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
      // Ensure token is a string (not number) - backend expects string
      const tokenString = String(token).trim();
      
      // Log for debugging (remove in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 2FA Verification Request:', {
          enable: true,
          secret: secret?.substring(0, 10) + '...', // Only log first 10 chars for security
          token: tokenString,
          tokenLength: tokenString.length,
        });
      }

      const response = await toggleTwoFa({
        enable: true,
        secret: secret,
        token: tokenString,
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
        onError: (errorMessage, statusCode) => {
          // Log detailed error for debugging
          console.error('❌ 2FA Verification Failed:', {
            errorMessage,
            statusCode,
            tokenLength: token.length,
            tokenValue: token,
            secretExists: !!secret,
            secretLength: secret?.length,
          });
          
          // Provide more helpful error message
          const friendlyError = errorMessage || 'Failed to verify code. Please try again.';
          setError(friendlyError + ' Make sure you\'re entering the CURRENT code from your authenticator app (codes change every 30 seconds).');
          toast.error(friendlyError);
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
      <CardHeader className="my-4">
        <div className="flex items-center gap-3 mb-4">
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
            <Alert className="border-primary/30 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary/90">{message}</AlertDescription>
            </Alert>

            {/* Two-column layout for larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column: QR Code and Secret */}
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border-2 border-primary shadow-lg relative overflow-hidden">
                  {/* Decorative corner accents */}
                  <div className="absolute top-0 left-0 w-16 h-16 bg-primary/30 rounded-br-full -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-primary/30 rounded-tl-full translate-x-1/2 translate-y-1/2"></div>
                  
                  <div className="relative bg-white p-3 rounded-md">
                    <img 
                      src={qrCodeUrl} 
                      alt="2FA QR Code" 
                      className="w-full max-w-xs h-auto drop-shadow-md"
                    />
                  </div>
                </div>
                
                {secret && (
                  <div className="w-full">
                    <p className="text-sm text-muted-foreground mb-2 text-center">
                      Can't scan? Enter this code manually:
                    </p>
                    <div className="relative p-3 bg-muted rounded-lg">
                      <code className="text-sm font-mono break-all block pr-10">{secret}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-7 w-7 p-0"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(secret);
                            setCopied(true);
                            toast.success('Secret code copied to clipboard');
                            setTimeout(() => setCopied(false), 2000);
                          } catch (err) {
                            toast.error('Failed to copy code');
                          }
                        }}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-success" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {!token && (
                  <div className="w-full pt-2">
                    <Button 
                      onClick={fetchQrCode} 
                      variant="outline" 
                      disabled={verifying || loading}
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50"
                    >
                      <RefreshCw className="mr-1 h-4 w-4" />
                      Regenerate QR Code
                    </Button>
                  </div>
                )}
              </div>

              {/* Right Column: Instructions and Verification Form */}
              <div className="flex flex-col space-y-4">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-semibold text-foreground">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>Open your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)</li>
                    <li>Scan the QR code above or enter the secret code manually</li>
                    <li>Wait for a 6-digit code to appear in your app (codes refresh every 30 seconds)</li>
                    <li>Enter the current 6-digit code from your app below to complete setup</li>
                  </ol>
                  <Alert className="mt-3 border-amber-300 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                    <AlertDescription className="text-sm text-amber-900 dark:text-amber-200">
                      <strong className="font-semibold">Important:</strong> Do not regenerate the QR code after scanning. Use the code from your authenticator app that matches this QR code.
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Verification Input */}
                <div className="space-y-3 pt-2">
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
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      ⏱️ Codes refresh every 30 seconds - use the current code displayed in your app
                    </p>
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
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify & Enable 2FA'
                    )}
                  </Button>
                </div>

                {token && (
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      Note: If you regenerate the QR code, you'll need to scan the new code with your authenticator app. 
                      Your current code will not work with a new QR code.
                    </p>
                  </div>
                )}
              </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8">
            {/* Left Side: SVG */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md">
                <Image
                  src="/media/svg/two-factor-authentication.svg"
                  alt="Two Factor Authentication"
                  width={800}
                  height={490}
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Right Side: Content and Button */}
            <div className="flex flex-col space-y-6">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground">
                  Why Enable Two-Factor Authentication?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Enhanced Security</p>
                      <p className="text-sm text-muted-foreground">
                        Protect your account even if your password is compromised. 2FA adds an extra layer of security that requires both your password and a code from your device.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Ban className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Prevent Unauthorized Access</p>
                      <p className="text-sm text-muted-foreground">
                        Even if someone gets your password, they can't access your account without your authenticator app. Your account stays secure.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Industry Standard</p>
                      <p className="text-sm text-muted-foreground">
                        Two-factor authentication is recommended by security experts and used by major platforms to protect user accounts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Heart className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-foreground">Peace of Mind</p>
                      <p className="text-sm text-muted-foreground">
                        Know that your sensitive data and transactions are protected with an additional security layer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex flex-col items-center">
                <Button 
                  onClick={fetchQrCode} 
                  variant="primary" 
                  size="lg"
                  className="w-full lg:w-auto px-8 py-6 text-base"
                >
                  <Shield className="mr-1 h-5 w-5" />
                  Generate QR Code
                </Button>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Click the button above to generate a QR code for setting up Two-Factor Authentication.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

