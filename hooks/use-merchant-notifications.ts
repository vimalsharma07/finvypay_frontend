/**
 * Hook to manage merchant notifications
 * Provides unread count and refresh functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getMerchantUnreadCount } from '@/lib/services/user/notifications';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export function useMerchantNotifications() {
  const pathname = usePathname();
  const isMerchantRoute = pathname?.startsWith('/dashboard') || 
                          pathname?.startsWith('/transactions') ||
                          pathname?.startsWith('/acquirer-accounts') ||
                          pathname?.startsWith('/risk-compliance') ||
                          pathname?.startsWith('/routing') ||
                          pathname?.startsWith('/cascading') ||
                          pathname?.startsWith('/support') ||
                          pathname?.startsWith('/payment-links') ||
                          pathname?.startsWith('/profile') ||
                          pathname?.startsWith('/rates') ||
                          pathname?.startsWith('/config') ||
                          pathname?.startsWith('/wallet') ||
                          pathname?.startsWith('/settings') ||
                          pathname?.startsWith('/reports') ||
                          pathname?.startsWith('/payouts') ||
                          pathname?.startsWith('/settlement') ||
                          false;
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!isMerchantRoute) {
      setLoading(false);
      return;
    }

    try {
      const response = await getMerchantUnreadCount();
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data.data) {
            setUnreadCount(data.data.unreadCount || 0);
          }
        },
        onError: (errorMessage) => {
          console.error('Failed to fetch notification count:', errorMessage);
          // Silently fail - don't show error toast for background updates
        },
        silent: true,
      });
    } catch (error) {
      console.error('Notification count fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [isMerchantRoute]);

  useEffect(() => {
    if (!isMerchantRoute) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount, isMerchantRoute]);

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount,
  };
}

