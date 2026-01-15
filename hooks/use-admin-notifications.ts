/**
 * Hook to manage admin notifications
 * Provides unread count and refresh functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { getAdminNotifications } from '@/lib/services/admin/notifications';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

export function useAdminNotifications() {
  const pathname = usePathname();
  const isAdminPath = pathname?.startsWith('/admin') ?? false;
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAdminPath) {
      setLoading(false);
      return;
    }

    try {
      const response = await getAdminNotifications({
        page: 1,
        limit: 1,
        includeDeleted: false,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      });

      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data?.success && data.meta) {
            setUnreadCount(data.meta.unreadCount || 0);
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
  }, [isAdminPath]);

  useEffect(() => {
    if (!isAdminPath) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    fetchUnreadCount();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount, isAdminPath]);

  return {
    unreadCount,
    loading,
    refresh: fetchUnreadCount,
  };
}

