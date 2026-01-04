'use client';

import dynamic from 'next/dynamic';
import { TableCardSkeleton } from '@/components/ui/skeletons';

// Dynamically import TableComp with loading state
export const DynamicTableComp = dynamic(
  () => import('@/app/(protected)/components/table-comp').then((mod) => ({ default: mod.TableComp })),
  {
    loading: () => <TableCardSkeleton rows={5} columns={4} />,
    ssr: false,
  }
);

// Re-export types for convenience
export type { TableCompProps } from '@/app/(protected)/components/table-comp';
export type { TableHeader, TableAction } from '@/app/(protected)/components/table-comp';

