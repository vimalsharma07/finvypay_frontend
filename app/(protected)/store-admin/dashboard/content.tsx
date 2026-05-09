'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Dynamically import dashboard components for code splitting
const Bestsellers = dynamic(
  () => import('@/app/(protected)/store-admin/dashboard/components/bestsellers').then((mod) => ({ default: mod.Bestsellers })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const Inventory = dynamic(
  () => import('@/app/(protected)/store-admin/dashboard/components/inventory').then((mod) => ({ default: mod.Inventory })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const InventorySummary = dynamic(
  () => import('@/app/(protected)/store-admin/dashboard/components/inventory-summary').then((mod) => ({ default: mod.InventorySummary })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const Orders = dynamic(
  () => import('@/app/(protected)/store-admin/dashboard/components/orders').then((mod) => ({ default: mod.Orders })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const RecentOrders = dynamic(
  () => import('@/app/(protected)/store-admin/dashboard/components/recent-orders').then((mod) => ({ default: mod.RecentOrders })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const SalesActivity = dynamic(
  () => import('@/app/(protected)/store-admin/dashboard/components/sales-activity').then((mod) => ({ default: mod.SalesActivity })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

export function DashboardContent() {
  return (
    <div className="flex flex-col gap-5 lg:gap-7.5">
      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5">
        <Orders />
        <Inventory />
        <Bestsellers />
      </div>

      <div className="grid lg:grid-cols-3 gap-5 lg:gap-7.5">
        <div className="lg:col-span-2">
          <SalesActivity />
        </div>

        <div className="lg:col-span-1">
          <InventorySummary />
        </div>
      </div>

      <div className="grid lg:grid-cols-1">
        <div className="lg:col-span-1">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
