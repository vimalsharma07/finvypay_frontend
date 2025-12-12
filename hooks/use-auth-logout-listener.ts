/**
 * React Hook for Listening to Auth Logout Events
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuthLogoutListener() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = (event: CustomEvent | MessageEvent) => {
      const detail = (event as CustomEvent).detail || (event as MessageEvent).data;
      const reason = detail?.reason;
      const message = detail?.message || 'Session expired. Please login again.';

      if (reason === 'refresh_failed' || reason === 'token_reuse' || reason === 'manual_logout') {
        toast.error(message === 'Session invalid — login again' ? message : 'Session expired. Please login again.');
        router.push('/signin');
      }
    };

    window.addEventListener('auth:logout', handleLogout as EventListener);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('auth');
      channel.onmessage = handleLogout;
    } catch (e) {
      // BroadcastChannel not supported
    }

    return () => {
      window.removeEventListener('auth:logout', handleLogout as EventListener);
      channel?.close();
    };
  }, [router]);
}

