'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import SearchDialog with loading state
const SearchDialogComponent = dynamic(
  () => import('@/app/components/partials/dialogs/search/search-dialog').then((mod) => ({ default: mod.SearchDialog })),
  {
    loading: () => (
      <div className="p-4 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export interface DynamicSearchDialogProps {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Dynamic SearchDialog component with loading state
 * Automatically handles code splitting
 */
export function DynamicSearchDialog({
  trigger,
  open,
  onOpenChange,
}: DynamicSearchDialogProps) {
  return (
    <SearchDialogComponent
      trigger={trigger}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

