'use client';

import { useEffect, useState } from 'react';
import {
  getSupportTickets,
  SupportTicketListResponse,
} from '@/lib/services/admin/support-ticket';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

interface UseAdminOpenTicketCountResult {
  count: number | null;
  loading: boolean;
}

export function useAdminOpenTicketCount(enabled = true): UseAdminOpenTicketCountResult {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setCount(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchCount = async () => {
      setLoading(true);
      try {
        const response = await getSupportTickets({
          limit: 1,
          status: 'OPEN',
        });

        handleApiResponse<SupportTicketListResponse>(response, {
          onSuccess: (data) => {
            if (!isMounted) return;
            const total =
              typeof data?.meta?.totalCount === 'number'
                ? data.meta.totalCount
                : 0;
            setCount(total);
          },
          onError: () => {
            if (!isMounted) return;
            setCount(null);
          },
          silent: true,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCount();

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  return { count, loading };
}

