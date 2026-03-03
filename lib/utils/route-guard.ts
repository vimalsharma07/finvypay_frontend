/**
 * Route Guard Utilities
 * 
 * Utilities for role-based and permission-based route protection
 */

import { UserRole } from './menu-utils';

/**
 * Permission-based route access rules
 * Maps specific routes to required permission identifiers
 * 
 * For User Management: Supports both ADMIN type and role-specific type permissions
 */
const PERMISSION_BASED_ROUTES: Record<string, string[]> = {
  '/admin/user-management/admin': ['view-admin-users'],
  '/admin/user-management/merchant': ['view-merchant-users', 'user-view-merchant-users'], // ADMIN type or MERCHANT type
  '/admin/user-management/affiliate': ['view-affiliate-users', 'affiliate-view-affiliate-users'], // ADMIN type or AFFILIATE type
};

/**
 * Route access rules
 * Maps route prefixes to allowed roles
 * 
 * For User Management: Only ADMIN, MERCHANT, AFFILIATE are supported
 * Note: Merchant routes don't have /merchant/ prefix in URL due to rewrites,
 * but files are organized in merchant folder
 */
const ROUTE_ACCESS_RULES: Record<string, UserRole[]> = {
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/affiliate': ['AFFILIATE'],
  // Merchant routes are accessed without prefix (e.g., /dashboard, /transactions)
  // These routes are handled separately in hasRouteAccess function
};

/**
 * Public routes that don't require role-based access
 */
const PUBLIC_ROUTES = [
  '/',
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/change-password',
  '/forbidden',
  '/not-found',
  '/error',
  '/docs',
];

/**
 * Check if a route is public (doesn't require role-based access)
 * 
 * @param pathname - The pathname to check
 * @returns True if the route is public
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Get the required role for a given route
 * 
 * @param pathname - The pathname to check
 * @returns The required role or null if route is public
 */
export function getRequiredRoleForRoute(pathname: string): UserRole[] | null {
  // Check if route is public
  if (isPublicRoute(pathname)) {
    return null;
  }

  // Check route access rules for admin and affiliate
  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ACCESS_RULES)) {
    if (pathname.startsWith(routePrefix)) {
      return allowedRoles;
    }
  }

  // Check for merchant routes (without /merchant/ prefix due to rewrites)
  const merchantRoutes = [
    '/dashboard',
    '/acquirer-accounts',
    '/acquirer-requests',
    '/transactions',
    '/risk-compliance',
    '/routing',
    '/cascading',
    '/support',
    '/payment-links',
    '/onboarding',
    '/profile',
    '/profile-selection',
    '/rates',
    '/config',
    '/wallet',
    '/settings',
    '/reports',
    '/payouts',
    '/settlement',
  ];
  
  const isMerchantRoute = merchantRoutes.some(route => pathname.startsWith(route));
  if (isMerchantRoute) {
    return ['MERCHANT'];
  }

  // If no specific rule matches, deny access by default
  return null;
}

/**
 * Check if a user role has access to a route
 * 
 * @param userRole - The user's role
 * @param pathname - The pathname to check
 * @returns True if the user has access
 */
export function hasRouteAccess(userRole: UserRole | null, pathname: string): boolean {
  if (!userRole) return false;

  const normalizedRole = userRole.toUpperCase();

  // Public routes allowed for everyone
  if (isPublicRoute(pathname)) return true;

  // Strict role → route matching
  // For User Management: Only ADMIN, MERCHANT, AFFILIATE are supported
  if (pathname.startsWith("/admin")) {
    return normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN";
  }

  if (pathname.startsWith("/affiliate")) {
    return normalizedRole === "AFFILIATE";
  }

  // Merchant routes don't have /merchant/ prefix (handled by rewrites)
  // Check for merchant routes: /dashboard, /transactions, /routing, etc.
  // Exclude admin, affiliate, and public routes which are already handled
  if (normalizedRole === "MERCHANT") {
    // List of merchant route paths (without /merchant/ prefix)
    const merchantRoutes = [
      '/dashboard',
      '/acquirer-accounts',
      '/acquirer-requests',
      '/transactions',
      '/risk-compliance',
      '/routing',
      '/cascading',
      '/support',
      '/payment-links',
      '/onboarding',
      '/profile',
      '/profile-selection',
      '/rates',
      '/config',
      '/wallet',
      '/settings',
      '/reports',
      '/payouts',
      '/settlement',
    ];
    
    // Check if pathname starts with any merchant route
    const isMerchantRoute = merchantRoutes.some(route => pathname.startsWith(route));
    return isMerchantRoute;
  }

  // If route does not match any category → deny by default
  return false;
}


/**
 * Check if user has required permission for a route
 * 
 * @param pathname - The pathname to check
 * @param hasPermission - Function to check if user has a permission
 * @returns True if user has required permission
 */
export function hasPermissionForRoute(
  pathname: string,
  hasPermission: (identifier: string) => boolean
): boolean {
  // Check permission-based routes first
  for (const [route, requiredPermissions] of Object.entries(PERMISSION_BASED_ROUTES)) {
    if (pathname.startsWith(route) || pathname === route) {
      // User needs at least one of the required permissions
      return requiredPermissions.some(permission => hasPermission(permission));
    }
  }
  
  // If not a permission-based route, return true (will fall back to role-based check)
  return true;
}

/**
 * Check if user is trying to access a route they don't have permission for
 * 
 * @param userRole - The user's role
 * @param pathname - The pathname to check
 * @param hasPermission - Optional function to check permissions (for permission-based routes)
 * @returns True if access should be denied
 */
export function shouldDenyAccess(
  userRole: UserRole | null,
  pathname: string,
  hasPermission?: (identifier: string) => boolean
): boolean {
  // First check permission-based routes if hasPermission is provided
  if (hasPermission) {
    const hasPermissionForRouteResult = hasPermissionForRoute(pathname, hasPermission);
    if (!hasPermissionForRouteResult) {
      return true; // Deny access if permission check failed
    }
  }
  
  // Fall back to role-based check for other routes
  return !hasRouteAccess(userRole, pathname);
}

