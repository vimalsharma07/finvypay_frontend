'use client';

import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const DashboardDarkPage = dynamic(
  () => import('../components/dashboard/dark-sidebar/dashboard-dark-page').then(mod => ({ default: mod.DashboardDarkPage })),
  { ssr: false }
);

export default function Page() {
  return <DashboardDarkPage />;
}
