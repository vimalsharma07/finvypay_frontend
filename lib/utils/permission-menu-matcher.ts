/**
 * Permission Menu Matcher
 * 
 * Utility functions to filter menu items based on user permissions
 * Uses explicit permissionModule field in menu items for accurate matching
 */

import { useAuthStore } from '@/lib/stores/auth-store';
import type { MenuConfig, MenuItem } from '@/config/types';

/**
 * Normalize text for comparison (lowercase, remove special chars)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim();
}

/**
 * Check if submodule matches (handles variations like "admin" matching "Admin User")
 * 
 * @param menuSubmodule - Menu submodule identifier (e.g., "admin", "merchant")
 * @param permissionSubModule - Permission subModule name (e.g., "Admin User", "Merchant")
 * @returns true if they match
 */
function matchesSubModule(menuSubmodule: string, permissionSubModule: string): boolean {
  if (!menuSubmodule || !permissionSubModule) return false;

  const normalizedMenu = normalizeText(menuSubmodule);
  const normalizedPermission = normalizeText(permissionSubModule);

  // Exact match
  if (normalizedMenu === normalizedPermission) {
    return true;
  }

  // Check if permission subModule contains menu submodule
  // e.g., "admin" matches "Admin User"
  if (normalizedPermission.includes(normalizedMenu)) {
    return true;
  }

  // Check if menu submodule contains permission's first word
  // e.g., "Admin User" first word "admin" matches "admin"
  const permissionFirstWord = normalizedPermission.split(/\s+/)[0];
  if (normalizedMenu === permissionFirstWord || normalizedMenu.includes(permissionFirstWord)) {
    return true;
  }

  return false;
}

/**
 * Check if user has access to a permission module
 * 
 * @param moduleName - Permission module name (e.g., "User Management", "Gateway Management")
 * @returns true if user has any permission for this module
 */
export function hasModuleAccess(moduleName: string): boolean {
  if (!moduleName) return false;

  const { permissions } = useAuthStore.getState();
  
  // Direct O(1) lookup
  return moduleName in permissions.byModule;
}

/**
 * Check if user has access to a specific submodule within a module
 * 
 * @param moduleName - Permission module name
 * @param submodule - Submodule identifier from menu item
 * @returns true if user has any permission for this submodule
 */
export function hasSubModuleAccess(moduleName: string, submodule: string): boolean {
  if (!moduleName || !submodule) return false;

  const { permissions } = useAuthStore.getState();
  const modulePermissions = permissions.byModule[moduleName] || [];

  // Check if any permission in the module matches the submodule
  return modulePermissions.some(perm => 
    matchesSubModule(submodule, perm.subModule)
  );
}

/**
 * Check if a menu item should be visible based on permissions
 * 
 * @param menuItem - Menu item to check
 * @param parentModule - Parent module name (for child items with submodule check)
 * @returns true if item should be visible
 */
export function isMenuItemVisible(menuItem: MenuItem, parentModule?: string): boolean {
  // Always show headings
  if (menuItem.heading) {
    return true;
  }

  // Don't show disabled items
  if (menuItem.disabled) {
    return false;
  }

  // If requirePermission is explicitly false, always show (skip all permission checks)
  // This allows items like Dashboard or Transactions to always be visible
  // even if permissionModule is set (permissionModule can be used for child items)
  if (menuItem.requirePermission === false) {
    return true;
  }

  // If requirePermission is false or undefined and no permissionModule, show it
  // This allows items like Dashboard to always be visible
  if (!menuItem.requirePermission && !menuItem.permissionModule && !menuItem.submodule) {
    return true;
  }

  // If submodule is specified, check submodule access (for child items)
  // Priority: parentModule > item's permissionModule
  if (menuItem.submodule) {
    const moduleToCheck = parentModule || menuItem.permissionModule;
    if (moduleToCheck) {
      return hasSubModuleAccess(moduleToCheck, menuItem.submodule);
    }
    // If submodule specified but no module, don't show
    return false;
  }

  // If permissionModule is specified, check module access
  if (menuItem.permissionModule) {
    return hasModuleAccess(menuItem.permissionModule);
  }

  // If parent module exists and no submodule specified, show if parent module has access
  if (parentModule) {
    return hasModuleAccess(parentModule);
  }

  // Default: show if no permission requirement
  return true;
}

/**
 * Filter menu items based on permissions
 * Recursively filters menu and its children
 * 
 * @param menuItems - Menu configuration to filter
 * @param parentModule - Parent module name (for child items with submodule check)
 * @returns Filtered menu configuration
 */
export function filterMenuByPermissions(menuItems: MenuConfig, parentModule?: string): MenuConfig {
  return menuItems
    .map((item): MenuItem | null => {
      // Determine the module for this item (use item's module or parent's module)
      const currentModule = item.permissionModule || parentModule;

      // Check if item should be visible
      if (!isMenuItemVisible(item, parentModule)) {
        return null;
      }

      // If item has children, recursively filter them
      if (item.children && item.children.length > 0) {
        // If parent has requirePermission: false, show all children without filtering
        // This allows parent to be visible and show all its children
        if (item.requirePermission === false) {
          return {
            ...item,
            children: item.children, // Show all children without filtering
          };
        }

        // Pass current module as parent for children
        const filteredChildren = filterMenuByPermissions(item.children, currentModule);
        
        // If all children are filtered out, don't show parent either
        if (filteredChildren.length === 0) {
          return null;
        }

        return {
          ...item,
          children: filteredChildren,
        };
      }

      // Item is visible, return it
      return item;
    })
    .filter((item): item is MenuItem => item !== null);
}
