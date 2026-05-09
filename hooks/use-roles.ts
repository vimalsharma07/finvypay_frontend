/**
 * Custom Hook for Fetching Roles
 * 
 * Provides a reusable hook for fetching roles by type with proper error handling
 */

import { useState, useEffect, useCallback } from 'react';
import { getRoles, Role, RoleListResponse } from '@/lib/services/admin/roles';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

interface UseRolesOptions {
  type?: string;
  autoFetch?: boolean;
  onSuccess?: (roles: Role[]) => void;
  onError?: (errorMessage: string) => void;
}

interface UseRolesReturn {
  roles: Role[];
  loadingRoles: boolean;
  error: string | null;
  fetchRoles: () => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage roles
 * 
 * @param options - Configuration options for role fetching
 * @returns Object containing roles, loading state, error, and fetch functions
 * 
 * @example
 * ```tsx
 * const { roles, loadingRoles, fetchRoles } = useRoles({ type: 'ADMIN' });
 * ```
 */
export function useRoles(options: UseRolesOptions = {}): UseRolesReturn {
  const { type, autoFetch = true, onSuccess, onError } = options;
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoadingRoles(true);
    setError(null);
    
    try {
      const response = await getRoles(type);
      
      handleApiResponse<RoleListResponse>(response, {
        onSuccess: (data) => {
          if (data?.success && Array.isArray(data.data)) {
            setRoles(data.data);
            setError(null);
            onSuccess?.(data.data);
          } else {
            const errorMsg = 'Failed to fetch roles - invalid response structure';
            console.warn('API returned invalid structure:', data);
            setError(errorMsg);
            toast.error(errorMsg);
            onError?.(errorMsg);
          }
        },
        onError: (errorMessage) => {
          const errorMsg = errorMessage || 'Failed to fetch roles';
          console.error('Error fetching roles:', errorMessage);
          setError(errorMsg);
          toast.error(errorMsg);
          onError?.(errorMsg);
        },
      });
    } catch (error) {
      const errorMsg = 'Network error while fetching roles';
      console.error('Network error:', error);
      setError(errorMsg);
      toast.error('Failed to fetch roles');
      onError?.(errorMsg);
    } finally {
      setLoadingRoles(false);
    }
  }, [type, onSuccess, onError]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchRoles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFetch]); // Only run on mount/unmount, fetchRoles is stable

  const refetch = useCallback(() => {
    return fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    loadingRoles,
    error,
    fetchRoles,
    refetch,
  };
}

