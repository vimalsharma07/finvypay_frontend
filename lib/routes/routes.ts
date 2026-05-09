/**
 * API Routes Configuration
 * 
 * Centralized endpoint management for easy change management
 * This file aggregates all routes for both Admin and Merchant modules.
 * 
 * Structure:
 * - Admin routes: ./admin/ (with sub-modules: users, master, reports, transactions, etc.)
 * - Merchant routes: ./merchant/ (with sub-modules: users, master, reports, transactions, etc.)
 * - Each sub-module has its own route file
 * - Update endpoints in their respective module files
 */

import { adminModuleRoutes } from './admin';
import { merchantModuleRoutes } from './merchant';

/**
 * Main Routes Export
 * Contains both Admin and Merchant module routes
 */
export const routes = {
  admin: adminModuleRoutes,
  merchant: merchantModuleRoutes,
} as const;

/**
 * Admin Routes (backward compatibility)
 * @deprecated Use routes.admin instead
 */
export const adminRoutes = adminModuleRoutes;
