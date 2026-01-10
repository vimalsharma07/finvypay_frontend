/**
 * Menu Utilities
 * 
 * Utilities for role-based menu selection
 */

import { ADMIN_MENU } from '@/config/menus/admin-menu';
import { USER_MENU } from '@/config/menus/user-menu';
import { AFFILIATE_MENU } from '@/config/menus/affiliate-menu';
import { getUser } from '@/lib/auth-storage';
import type { MenuConfig } from '@/config/types';

/**
 * Extract role from API response data
 * 
 * @param responseData - API response data object
 * @returns Normalized role string or null
 */
export function extractRoleFromResponse(responseData: any): UserRole | null {
  if (!responseData) return null;

  const role = 
    responseData.role?.type || 
    responseData.role?.name || 
    responseData.role?.slug ||
    responseData.user?.role?.type ||
    responseData.user?.role?.name ||
    responseData.user?.role?.slug ||
    responseData.user?.roleName ||
    responseData.userData?.role?.type ||
    responseData.userData?.role?.name ||
    responseData.userData?.role?.slug ||
    responseData.userData?.roleName ||
    responseData.roleName || 
    responseData.roleType ||
    (typeof responseData.role === 'string' ? responseData.role : null) ||
    (typeof responseData.user?.role === 'string' ? responseData.user.role : null) ||
    (typeof responseData.userData?.role === 'string' ? responseData.userData.role : null);

  return role ? (typeof role === 'string' ? role.toUpperCase() : role) as UserRole : null;
}

/**
 * Handle login redirect after successful authentication
 * 
 * @param responseData - API response data (optional)
 * @param router - Next.js router instance
 * @param delay - Delay in milliseconds before redirect (default: 200)
 */
export function handleLoginRedirect(
  responseData?: any,
  router?: { push: (path: string) => void },
  delay: number = 200
): void {
  if (typeof window === 'undefined' || !router) return;

  setTimeout(() => {
    let userRole: UserRole | null = null;

    // Try to extract role from response data
    if (responseData?.data) {
      userRole = extractRoleFromResponse(responseData.data);
    }

    // Fallback: try to get role from stored user data
    if (!userRole) {
      const storedUser = getUser();
      if (storedUser) {
        userRole = extractRoleFromResponse(storedUser);
      }
    }

    const redirectPath = getRedirectPathByRole(userRole);

    if (process.env.NODE_ENV === 'development') {
      console.log('[handleLoginRedirect] Role:', userRole, 'Redirect Path:', redirectPath);
    }

    router.push(redirectPath);
  }, delay);
}

/**
 * User role types
 * For User Management: Only ADMIN, MERCHANT, AFFILIATE are supported
 */
export type UserRole = 'ADMIN' | 'MERCHANT' | 'AFFILIATE' | string;

/**
 * Get user role from stored user data
 * 
 * @param pathname - Optional pathname to infer role from URL if user data doesn't have role
 * @returns User role or null if not found
 */
export function getUserRole(pathname?: string): UserRole | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const user = getUser();
    console.log('user', user);
    // Check for role in various possible locations
    // Priority: role.type > role.name > role.slug > roleName > roleType > role (if string)
    let role: string | null = null;
    
    if (user) {
      role = 
        user.role?.type || 
        user.role?.name || 
        user.role?.slug ||
        user.roleName || 
        user.roleType ||
        (typeof user.role === 'string' ? user.role : null);
    }
    
    // If role not found in user data, try to infer from URL path
    if (!role && pathname) {
      if (pathname.startsWith('/admin/')) {
        role = 'ADMIN';
      } else if (pathname.startsWith('/affiliate/')) {
        role = 'AFFILIATE';
      } else if (
        // Merchant routes don't have /merchant/ prefix (handled by rewrites)
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/acquirer-accounts') ||
        pathname.startsWith('/acquirer-requests') ||
        pathname.startsWith('/transactions') ||
        pathname.startsWith('/risk-compliance') ||
        pathname.startsWith('/routing') ||
        pathname.startsWith('/cascading') ||
        pathname.startsWith('/support') ||
        pathname.startsWith('/payment-links') ||
        pathname.startsWith('/onboarding') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/rates') ||
        pathname.startsWith('/wallet') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/reports') ||
        pathname.startsWith('/payouts')
      ) {
        role = 'MERCHANT';
      }
    }
    
    if (!role) {
      // Debug: log if role is not found (only in development)
      if (process.env.NODE_ENV === 'development') {
        if (user) {
          console.warn('[getUserRole] User role not found in user data. Available keys:', Object.keys(user));
          console.warn('[getUserRole] User role object:', user.role);
        } else {
          console.warn('[getUserRole] No user data found');
        }
      }
      return null;
    }

    // Normalize role to uppercase for consistency
    const normalizedRole = typeof role === 'string' ? role.toUpperCase() : role;
    
    if (process.env.NODE_ENV === 'development') {
      console.debug('[getUserRole] Detected role:', normalizedRole, 'from', user ? 'user data' : 'URL path');
    }
    
    return normalizedRole as UserRole;
  } catch (error) {
    console.error('[getUserRole] Error getting user role:', error);
    return null;
  }
}

/**
 * Get menu configuration based on user role
 * 
 * @param role - User role (optional, will be fetched if not provided)
 * @param pathname - Optional pathname to infer role from URL
 * @returns Menu configuration for the user's role
 */
export function getMenuByRole(role?: UserRole | null, pathname?: string): MenuConfig {
  const userRole = role || getUserRole(pathname);

  // If still no role, try to infer from pathname
  if (!userRole && pathname) {
    if (pathname.startsWith('/admin/')) {
      try {
        const { getAdminMenu } = require('@/config/menus/admin-menu');
        return getAdminMenu();
      } catch {
        return ADMIN_MENU;
      }
    } else if (pathname.startsWith('/affiliate/')) {
      return AFFILIATE_MENU;
    } else if (
      // Merchant routes don't have /merchant/ prefix (handled by rewrites)
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/acquirer-accounts') ||
      pathname.startsWith('/acquirer-requests') ||
      pathname.startsWith('/transactions') ||
      pathname.startsWith('/risk-compliance') ||
      pathname.startsWith('/routing') ||
      pathname.startsWith('/cascading') ||
      pathname.startsWith('/support') ||
      pathname.startsWith('/payment-links') ||
      pathname.startsWith('/onboarding') ||
      pathname.startsWith('/profile') ||
      pathname.startsWith('/rates') ||
      pathname.startsWith('/wallet') ||
      pathname.startsWith('/settings') ||
      pathname.startsWith('/reports') ||
      pathname.startsWith('/payouts')
    ) {
      try {
        const { getUserMenu } = require('@/config/menus/user-menu');
        return getUserMenu();
      } catch {
        return USER_MENU;
      }
    }
  }

  // Default to admin menu if role is not found
  if (!userRole) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getMenuByRole] No role found, defaulting to ADMIN_MENU');
    }
    return ADMIN_MENU;
  }

  // Map role to menu
  switch (userRole.toUpperCase()) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      // Use getAdminMenu() to get permission-filtered menu
      try {
        const { getAdminMenu } = require('@/config/menus/admin-menu');
        return getAdminMenu();
      } catch {
        return ADMIN_MENU;
      }
    case 'MERCHANT':
      // Use getUserMenu() to get permission-filtered menu
      try {
        const { getUserMenu } = require('@/config/menus/user-menu');
        return getUserMenu();
      } catch {
        return USER_MENU;
      }
    case 'AFFILIATE':
      return AFFILIATE_MENU;
    default:
      // Default to admin menu for unknown roles
      if (process.env.NODE_ENV === 'development') {
        console.warn('[getMenuByRole] Unknown role:', userRole, 'defaulting to ADMIN_MENU');
      }
      try {
        const { getAdminMenu } = require('@/config/menus/admin-menu');
        return getAdminMenu();
      } catch {
        return ADMIN_MENU;
      }
  }
}

/**
 * Get redirect path based on user role
 * 
 * @param role - User role (optional, will be fetched if not provided)
 * @returns Redirect path for the user's role
 */
export function getRedirectPathByRole(role?: UserRole | null): string {
  const userRole = role || getUserRole();

  if (!userRole) {
    // Debug: log if role is not found (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.warn('[getRedirectPathByRole] No role found, returning base URL');
      const user = getUser();
      if (user) {
        console.warn('[getRedirectPathByRole] User data:', {
          role: user.role,
          roleName: user.roleName,
          roleType: user.roleType,
          keys: Object.keys(user),
        });
      }
    }
    return '/';
  }

  // Normalize role to uppercase for comparison
  const normalizedRole = typeof userRole === 'string' ? userRole.toUpperCase() : userRole;

  // Handle super_admin explicitly
  if (normalizedRole === 'SUPER_ADMIN' || (typeof userRole === 'string' && userRole.toLowerCase() === 'super_admin')) {
    return '/admin/dashboard';
  }

  // Map role to default redirect path
  switch (normalizedRole) {
    case 'ADMIN':
      return '/admin/dashboard';
    case 'MERCHANT':
      return '/dashboard'; // No /merchant/ prefix due to rewrites
    case 'AFFILIATE':
      return '/affiliate/dashboard';
    default:
      // Debug: log unknown role (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn('[getRedirectPathByRole] Unknown role:', normalizedRole, 'returning base URL');
      }
      return '/';
  }
}

