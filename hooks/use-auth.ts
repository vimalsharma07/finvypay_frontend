/**
 * Auth Hook
 * 
 * Convenient hook to access auth store state and actions
 */

import { useAuthStore } from '@/lib/stores/auth-store';

/**
 * Hook to access auth state and actions
 * 
 * @example
 * ```tsx
 * const { user, permissions, hasPermission, isLoading } = useAuth();
 * 
 * if (hasPermission('create-user')) {
 *   // Show create user button
 * }
 * ```
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const permissions = useAuthStore((state) => state.permissions);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
  const hasAllPermissions = useAuthStore((state) => state.hasAllPermissions);
  const hasModule = useAuthStore((state) => state.hasModule);
  const hasSubModule = useAuthStore((state) => state.hasSubModule);
  const getPermission = useAuthStore((state) => state.getPermission);
  const getPermissionsByModule = useAuthStore((state) => state.getPermissionsByModule);
  const getPermissionsBySubModule = useAuthStore((state) => state.getPermissionsBySubModule);
  const getModules = useAuthStore((state) => state.getModules);
  const getSubModules = useAuthStore((state) => state.getSubModules);
  const getSubModulesByModule = useAuthStore((state) => state.getSubModulesByModule);

  return {
    user,
    permissions, // Optimized structure with all, byModule, bySubModule, etc.
    permissionsList: permissions.all, // Flat array for backward compatibility
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModule,
    hasSubModule,
    getPermission,
    getPermissionsByModule,
    getPermissionsBySubModule,
    getModules,
    getSubModules,
    getSubModulesByModule,
    // Convenience getters
    isAuthenticated: !!user,
    userRole: user?.role || null,
    userId: user?.id || null,
    userEmail: user?.email || null,
  };
}

