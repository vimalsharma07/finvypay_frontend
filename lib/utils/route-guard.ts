/**
 * Route Guard Utilities
 * 
 * Utilities for role-based route protection
 */

import { UserRole } from './menu-utils';

/**
 * Route access rules
 * Maps route prefixes to allowed roles
 */
const ROUTE_ACCESS_RULES: Record<string, UserRole[]> = {
  '/admin': ['ADMIN', 'SUPER_ADMIN'],
  '/user': ['USER', 'MERCHANT'],
  '/affiliate': ['AFFILIATE', 'AFFILIATE_PARTNER'],
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

  // Check route access rules
  for (const [routePrefix, allowedRoles] of Object.entries(ROUTE_ACCESS_RULES)) {
    if (pathname.startsWith(routePrefix)) {
      return allowedRoles;
    }
  }

  // If no specific rule matches, allow access (for other protected routes)
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
  if (pathname.startsWith("/admin")) {
    return normalizedRole === "ADMIN";
  }

  if (pathname.startsWith("/user")) {
    return normalizedRole === "USER";
  }

  if (pathname.startsWith("/affiliate")) {
    return normalizedRole === "AFFILIATE";
  }

  // If route does not match any category → allow or deny?
  // You should decide, but usually DENY by default:
  return false;
}


/**
 * Check if user is trying to access a route they don't have permission for
 * 
 * @param userRole - The user's role
 * @param pathname - The pathname to check
 * @returns True if access should be denied
 */
export function shouldDenyAccess(userRole: UserRole | null, pathname: string): boolean {
  return !hasRouteAccess(userRole, pathname);
}

