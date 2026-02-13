'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { storeAuthData } from '@/lib/auth-storage';
import { setAccessToken } from '@/lib/api';
import { getProfile, getPermissions } from '@/lib/services/auth';

export default function ImpersonateLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken') || undefined;

      if (!accessToken) {
        setError('Missing impersonation token. Please try again from the admin panel.');
        return;
      }

      // Mark this window as impersonation so we never touch localStorage (admin tab stays intact)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('impersonation', '1');
      }

      try {
        // Persist tokens for this new tab/session only
        storeAuthData({
          accessToken,
          refreshToken,
        });

        // Also update in‑memory token for the HTTP client
        setAccessToken(accessToken);

        // Hydrate user profile and permissions for route guard / menus
        try {
          await getProfile();
        } catch (profileError) {
          console.error('Impersonation profile fetch failed:', profileError);
        }

        try {
          await getPermissions();
        } catch (permError) {
          console.error('Impersonation permissions fetch failed:', permError);
        }

        toast.success('Impersonate session started');
        // Now that this tab has its own impersonated session, move into the protected area
        router.replace('/dashboard');
      } catch (e) {
        console.error('Failed to initialize impersonated session:', e);
        setError('Failed to initialize impersonated session. Please close this window and try again.');
      }
    };

    void bootstrap();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="space-y-3 text-center">
        {!error ? (
          <>
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Preparing impersonated session...
            </p>
            <p className="text-xs text-muted-foreground">
              You will be redirected to the merchant dashboard in a moment.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-destructive">
              {error}
            </p>
          </>
        )}
      </div>
    </div>
  );
}


