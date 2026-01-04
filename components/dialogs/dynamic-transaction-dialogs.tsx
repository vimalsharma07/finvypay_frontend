'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import transaction dialogs with loading states
export const DynamicTransactionDetailsDialog = dynamic(
  () => import('@/app/(protected)/admin/transactions/shared/transaction-details-dialog').then(
    mod => ({ default: mod.TransactionDetailsDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicTransactionDetailsDialogUser = dynamic(
  () => import('@/app/(protected)/user/transactions/shared/transaction-details-dialog').then(
    mod => ({ default: mod.TransactionDetailsDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicChargebackDialog = dynamic(
  () => import('@/app/(protected)/admin/transactions/shared/chargeback-dialog').then(
    mod => ({ default: mod.ChargebackDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicRefundDialog = dynamic(
  () => import('@/app/(protected)/admin/transactions/shared/refund-dialog').then(
    mod => ({ default: mod.RefundDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicSuspiciousDialog = dynamic(
  () => import('@/app/(protected)/admin/transactions/shared/suspicious-dialog').then(
    mod => ({ default: mod.SuspiciousDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    ),
    ssr: false,
  }
);

