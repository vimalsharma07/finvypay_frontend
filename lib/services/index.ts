/**
 * Services Index
 * 
 * Centralized exports for all API services
 * Easy access: import { login } from '@/lib/services'
 */

// Re-export shared types
export type { ApiResponse } from './types';

// Re-export services
export * from './auth';
export * from './admin';

