'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/ui/skeletons';

/**
 * Higher-order component for dynamically loading page content
 * Use this for heavy page components that should be code-split
 * 
 * @example
 * ```tsx
 * const AdminUsersPageContent = dynamicPageContent(
 *   () => import('./admin-users-content'),
 *   'AdminUsersPageContent'
 * );
 * ```
 */
export function dynamicPageContent<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> } | { [key: string]: React.ComponentType<T> }>,
  exportName?: string,
  options?: {
    loading?: () => React.ReactNode;
    ssr?: boolean;
  }
) {
  return dynamic(
    async () => {
      const module = await importFn();
      
      // Handle both default and named exports
      if (exportName && !('default' in module)) {
        return { default: module[exportName] } as { default: React.ComponentType<T> };
      }
      
      return module as { default: React.ComponentType<T> };
    },
    {
      loading: options?.loading || (() => <PageSkeleton />),
      ssr: options?.ssr ?? false,
    }
  ) as React.ComponentType<T>;
}

/**
 * Pre-configured dynamic import for table-heavy pages
 */
export function dynamicTablePage<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> } | { [key: string]: React.ComponentType<T> }>,
  exportName?: string
) {
  return dynamicPageContent(importFn, exportName, {
    ssr: false,
  });
}

/**
 * Pre-configured dynamic import for form-heavy pages
 */
export function dynamicFormPage<T = any>(
  importFn: () => Promise<{ default: React.ComponentType<T> } | { [key: string]: React.ComponentType<T> }>,
  exportName?: string
) {
  return dynamicPageContent(importFn, exportName, {
    ssr: false,
  });
}

