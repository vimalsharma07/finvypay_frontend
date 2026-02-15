/**
 * Auth Store (Zustand)
 * 
 * Global state management for user profile and permissions
 * Persists to localStorage for reloads
 * Optimized module-wise permission structure for fast lookups
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Permission type based on API response
export interface Permission {
  id: number;
  name: string;
  identifier: string;
  module: string;
  subModule: string;
  type: string;
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  role: string;
  [key: string]: any; // Allow additional user properties
}

// Optimized permission structure for fast lookups
interface PermissionStructure {
  // Flat array (for backward compatibility and iteration)
  all: Permission[];
  
  // Module-wise organization
  byModule: Record<string, Permission[]>;
  
  // Sub-module-wise organization
  bySubModule: Record<string, Permission[]>;
  
  // Fast lookup maps
  byIdentifier: Record<string, Permission>;
  byId: Record<number, Permission>;
  
  // Module metadata
  modules: string[];
  subModules: string[];
}

// Auth store state
interface AuthState {
  // User profile
  user: UserProfile | null;
  
  // Permissions (optimized structure)
  permissions: PermissionStructure;
  
  // Loading states
  isLoading: boolean;
  isPermissionsLoading: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setPermissions: (permissions: Permission[]) => void;
  setUserAndPermissions: (user: UserProfile, permissions: Permission[]) => void;
  clearAuth: () => void;
  
  // Helpers - Fast lookups
  hasPermission: (identifier: string) => boolean;
  hasAnyPermission: (identifiers: string[]) => boolean;
  hasAllPermissions: (identifiers: string[]) => boolean;
  hasModule: (module: string) => boolean;
  hasSubModule: (subModule: string) => boolean;
  getPermission: (identifier: string) => Permission | undefined;
  getPermissionsByModule: (module: string) => Permission[];
  getPermissionsBySubModule: (subModule: string) => Permission[];
  getModules: () => string[];
  getSubModules: () => string[];
  getSubModulesByModule: (module: string) => string[];
}

// Helper function to build optimized permission structure
function buildPermissionStructure(permissions: Permission[]): PermissionStructure {
  const structure: PermissionStructure = {
    all: permissions,
    byModule: {},
    bySubModule: {},
    byIdentifier: {},
    byId: {},
    modules: [],
    subModules: [],
  };

  // Build optimized structure
  permissions.forEach((permission) => {
    // By module
    if (!structure.byModule[permission.module]) {
      structure.byModule[permission.module] = [];
      structure.modules.push(permission.module);
    }
    structure.byModule[permission.module].push(permission);

    // By sub-module
    if (!structure.bySubModule[permission.subModule]) {
      structure.bySubModule[permission.subModule] = [];
      structure.subModules.push(permission.subModule);
    }
    structure.bySubModule[permission.subModule].push(permission);

    // Fast lookups
    structure.byIdentifier[permission.identifier] = permission;
    structure.byId[permission.id] = permission;
  });

  // Remove duplicates and sort
  structure.modules = Array.from(new Set(structure.modules)).sort();
  structure.subModules = Array.from(new Set(structure.subModules)).sort();

  return structure;
}

// Initial permission structure
const initialPermissionStructure: PermissionStructure = {
  all: [],
  byModule: {},
  bySubModule: {},
  byIdentifier: {},
  byId: {},
  modules: [],
  subModules: [],
};

// Initial state
const initialState = {
  user: null,
  permissions: initialPermissionStructure,
  isLoading: false,
  isPermissionsLoading: false,
};

// Create the store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Set user profile
      setUser: (user) => {
        set({ user });
      },

      // Set permissions (builds optimized structure)
      setPermissions: (permissions) => {
        const structure = buildPermissionStructure(permissions);
        set({ permissions: structure });
      },

      // Set both user and permissions at once
      setUserAndPermissions: (user, permissions) => {
        const structure = buildPermissionStructure(permissions);
        set({ user, permissions: structure });
      },

      // Clear all auth data
      clearAuth: () => {
        set(initialState);
      },

      // Check if user has a specific permission by identifier (O(1) lookup)
      hasPermission: (identifier: string) => {
        const { permissions } = get();
        return identifier in permissions.byIdentifier;
      },

      // Check if user has any of the specified permissions (optimized)
      hasAnyPermission: (identifiers: string[]) => {
        const { permissions } = get();
        return identifiers.some((identifier) => identifier in permissions.byIdentifier);
      },

      // Check if user has all of the specified permissions (optimized)
      hasAllPermissions: (identifiers: string[]) => {
        const { permissions } = get();
        return identifiers.every((identifier) => identifier in permissions.byIdentifier);
      },

      // Check if module exists (O(1) lookup)
      hasModule: (module: string) => {
        const { permissions } = get();
        return module in permissions.byModule;
      },

      // Check if sub-module exists (O(1) lookup)
      hasSubModule: (subModule: string) => {
        const { permissions } = get();
        return subModule in permissions.bySubModule;
      },

      // Get permission by identifier (O(1) lookup)
      getPermission: (identifier: string) => {
        const { permissions } = get();
        return permissions.byIdentifier[identifier];
      },

      // Get permissions by module (O(1) lookup)
      getPermissionsByModule: (module: string) => {
        const { permissions } = get();
        return permissions.byModule[module] || [];
      },

      // Get permissions by sub-module (O(1) lookup)
      getPermissionsBySubModule: (subModule: string) => {
        const { permissions } = get();
        return permissions.bySubModule[subModule] || [];
      },

      // Get all modules
      getModules: () => {
        const { permissions } = get();
        return permissions.modules;
      },

      // Get all sub-modules
      getSubModules: () => {
        const { permissions } = get();
        return permissions.subModules;
      },

      // Get sub-modules for a specific module
      getSubModulesByModule: (module: string) => {
        const { permissions } = get();
        const modulePermissions = permissions.byModule[module] || [];
        const subModules = new Set(modulePermissions.map((p) => p.subModule));
        return Array.from(subModules).sort();
      },
    }),
    {
      name: 'auth-storage', // localStorage key
      // Only persist user and permissions, not loading states
      partialize: (state) => ({
        user: state.user,
        permissions: state.permissions,
      }),
      // Rebuild structure on rehydration (in case structure changes)
      onRehydrateStorage: () => (state) => {
        if (state?.permissions?.all) {
          // Rebuild optimized structure from flat array
          state.permissions = buildPermissionStructure(state.permissions.all);
        }
      },
    }
  )
);

