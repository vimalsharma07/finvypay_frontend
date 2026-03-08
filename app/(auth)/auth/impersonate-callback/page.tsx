'use client';

import { useEffect, useState, useRef } from 'react';
import { applyAuthResponse, type AuthResponse } from '@/lib/services/auth';
import { fetchAndStorePermissions } from '@/lib/utils/auth-helpers';
import { getRedirectPathByRole } from '@/lib/utils/menu-utils';
import { LoaderCircle, AlertCircle } from 'lucide-react';

const IMPERSONATE_READY = 'impersonate-ready';
const IMPERSONATE_AUTH = 'impersonate-auth';
const IMPERSONATE_TIMEOUT_MS = 15_000;

export default function ImpersonateCallbackPage() {
  const [status, setStatus] = useState<'waiting' | 'applying' | 'done' | 'error'>('waiting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const appliedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || appliedRef.current) return;

    const handleMessage = async (event: MessageEvent) => {
      if (event.source !== window.opener || event.origin !== window.location.origin) return;
      const { type, payload } = event.data || {};
      if (type !== IMPERSONATE_AUTH || !payload) return;
      if (appliedRef.current) return;
      appliedRef.current = true;

      setStatus('applying');
      try {
        const ok = await applyAuthResponse(payload as AuthResponse);
        if (!ok) {
          setStatus('error');
          setErrorMessage('Invalid auth response.');
          return;
        }
        await fetchAndStorePermissions();
        setStatus('done');
        const path = getRedirectPathByRole();
        window.location.href = path || '/dashboard';
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Failed to sign in as user.');
      }
    };

    window.addEventListener('message', handleMessage);
    // Notify opener that this window is ready to receive auth data
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({ type: IMPERSONATE_READY }, window.location.origin);
    } else {
      setStatus('error');
      setErrorMessage('This page must be opened from the admin user management screen.');
    }

    const timeout = window.setTimeout(() => {
      if (!appliedRef.current) {
        appliedRef.current = true;
        setStatus('error');
        setErrorMessage('Request timed out. Please try again from the merchant list.');
      }
    }, IMPERSONATE_TIMEOUT_MS);

    return () => {
      window.removeEventListener('message', handleMessage);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 p-4">
      {status === 'waiting' && (
        <>
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Preparing to sign in as user…</p>
        </>
      )}
      {status === 'applying' && (
        <>
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </>
      )}
      {status === 'done' && (
        <>
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting…</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
          </div>
          <p className="text-center text-sm font-medium text-foreground">{errorMessage}</p>
          <p className="text-center text-xs text-muted-foreground">
            You can close this window and try again from the admin merchant list.
          </p>
        </>
      )}
    </div>
  );
}
