'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamically import user dialogs with loading states
export const DynamicCreateTicketDialog = dynamic(
  () => import('@/app/(protected)/(merchant)/support/components/create-ticket-dialog').then(
    mod => ({ default: mod.CreateTicketDialog })
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

export const DynamicEditTicketDialog = dynamic(
  () => import('@/app/(protected)/(merchant)/support/components/edit-ticket-dialog').then(
    mod => ({ default: mod.EditTicketDialog })
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

export const DynamicAddCardDialog = dynamic(
  () => import('@/app/(protected)/(merchant)/risk-compliance/trusted-cards/components/add-card-dialog').then(
    mod => ({ default: mod.AddCardDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicAddCardDialogAdmin = dynamic(
  () => import('@/app/(protected)/admin/risk-compliance/trusted-cards/components/add-card-dialog').then(
    mod => ({ default: mod.AddCardDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicEditCardDialog = dynamic(
  () => import('@/app/(protected)/(merchant)/risk-compliance/trusted-cards/components/edit-card-dialog').then(
    mod => ({ default: mod.EditCardDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicAddRiskDialog = dynamic(
  () => import('@/app/(protected)/(merchant)/risk-compliance/manage-risk/components/add-risk-dialog').then(
    mod => ({ default: mod.AddRiskDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicAddRiskDialogAdmin = dynamic(
  () => import('@/app/(protected)/admin/risk-compliance/manage-risk/components/add-risk-dialog').then(
    mod => ({ default: mod.AddRiskDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicEditRiskDialog = dynamic(
  () => import('@/app/(protected)/(merchant)/risk-compliance/manage-risk/components/edit-risk-dialog').then(
    mod => ({ default: mod.EditRiskDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicAddIpDialog = dynamic(
  () => import('@/app/(protected)/(merchant)/risk-compliance/ip-allowlist/components/add-ip-dialog').then(
    mod => ({ default: mod.AddIpDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicAddIpDialogAdmin = dynamic(
  () => import('@/app/(protected)/admin/risk-compliance/ip-allowlist/components/add-ip-dialog').then(
    mod => ({ default: mod.AddIpDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

export const DynamicEditIpDialog = dynamic(
  () => import('@/app/(protected)/admin/risk-compliance/ip-allowlist/components/edit-ip-dialog').then(
    mod => ({ default: mod.EditIpDialog })
  ),
  {
    loading: () => (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    ),
    ssr: false,
  }
);

