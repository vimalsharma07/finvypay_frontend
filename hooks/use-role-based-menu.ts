/**
 * Hook for role-based menu selection
 * 
 * Returns the appropriate menu configuration based on the current user's role
 */

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getMenuByRole, getUserRole } from '@/lib/utils/menu-utils';
import type { MenuConfig } from '@/config/types';

/**
 * Hook to get menu based on user role
 * 
 * @returns Menu configuration for the current user's role
 */
export function useRoleBasedMenu(): MenuConfig {
  const pathname = usePathname();

  // Recalculate menu whenever pathname changes or component re-renders
  // This ensures the menu updates when navigating between role-based pages
  // Pass pathname to both getUserRole and getMenuByRole so they can infer role from URL if user data doesn't have it
  const menu = useMemo(() => {
    const role = getUserRole(pathname);
    const menuConfig = getMenuByRole(role, pathname);
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('[useRoleBasedMenu] Pathname:', pathname);
      console.debug('[useRoleBasedMenu] Detected role:', role);
      console.debug('[useRoleBasedMenu] Menu items count:', menuConfig.length);
      console.debug('[useRoleBasedMenu] First menu item:', menuConfig[0]?.title);
    }
    
    return menuConfig;
  }, [pathname]); // Recalculate when pathname changes

  return menu;
}

