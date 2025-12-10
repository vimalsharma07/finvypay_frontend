'use client';

import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const Demo1DarkSidebarPage = dynamic(
  () => import('../components/demo1/dark-sidebar/demo1-dark-sidebar-page').then(mod => ({ default: mod.Demo1DarkSidebarPage })),
  { ssr: false }
);

export default function Page() {
  return <Demo1DarkSidebarPage />;
}
