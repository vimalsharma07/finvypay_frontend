/**
 * Auth Helpers
 * 
 * Helper functions for authentication flow including permissions fetching
 */

import { getPermissions } from '@/lib/services/auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { Permission, UserProfile } from '@/lib/stores/auth-store';

/**
 * Fetch and store user permissions after login
 * 
 * @returns Promise that resolves when permissions are fetched and stored
 */
export async function fetchAndStorePermissions(): Promise<void> {
  try {
    const response = await getPermissions();

    if (response.status === 200 && response.data?.success && response.data?.data) {
      const { data } = response.data;
      
      // Extract user profile
      const userProfile: UserProfile = {
        id: data.id,
        email: data.email,
        role: data.role,
      };

      // Extract permissions
      const permissions: Permission[] = data.permissions || [];

      // Store in Zustand store (will automatically build optimized structure)
      useAuthStore.getState().setUserAndPermissions(userProfile, permissions);

      if (process.env.NODE_ENV === 'development') {
        console.log('[fetchAndStorePermissions] Permissions fetched and stored:', {
          user: userProfile,
          permissionsCount: permissions.length,
        });
      }
    } else {
      console.error('[fetchAndStorePermissions] Failed to fetch permissions:', response);
      throw new Error(response.error || 'Failed to fetch permissions');
    }
  } catch (error) {
    console.error('[fetchAndStorePermissions] Error fetching permissions:', error);
    throw error;
  }
}

/**
 * Initialize auth state from stored data (for app reloads)
 * This should be called on app initialization if user is already authenticated
 */
export async function initializeAuthState(): Promise<void> {
  const { user, permissions } = useAuthStore.getState();
  
  // If we already have user and permissions, no need to fetch
  if (user && permissions.all.length > 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[initializeAuthState] Auth state already initialized from store');
    }
    return;
  }

  // If user exists but permissions are missing, fetch them
  if (user && permissions.all.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[initializeAuthState] User exists but permissions missing, fetching...');
    }
    try {
      await fetchAndStorePermissions();
    } catch (error) {
      console.error('[initializeAuthState] Failed to fetch permissions:', error);
    }
  }
}

