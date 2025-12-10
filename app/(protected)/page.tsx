'use client';

import dynamic from 'next/dynamic';
import { useSettings } from '@/providers/settings-provider';

// Dynamically import to avoid SSR issues
const Demo1LightSidebarPage = dynamic(
  () => import('./components/demo1').then(mod => ({ default: mod.Demo1LightSidebarPage })),
  { ssr: false }
);
const Demo2Page = dynamic(
  () => import('./components/demo2').then(mod => ({ default: mod.Demo2Page })),
  { ssr: false }
);
const Demo3Page = dynamic(
  () => import('./components/demo3').then(mod => ({ default: mod.Demo3Page })),
  { ssr: false }
);
const Demo4Page = dynamic(
  () => import('./components/demo4').then(mod => ({ default: mod.Demo4Page })),
  { ssr: false }
);
const Demo5Page = dynamic(
  () => import('./components/demo5').then(mod => ({ default: mod.Demo5Page })),
  { ssr: false }
);

export default function Page() {
  const { settings } = useSettings();

  if (settings?.layout === 'demo1') {
    return <Demo1LightSidebarPage />;
  } else if (settings?.layout === 'demo2') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo3') {
    return <Demo3Page />;
  } else if (settings?.layout === 'demo4') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo5') {
    return <Demo5Page />;
  } else if (settings?.layout === 'demo6') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo7') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo8') {
    return <Demo4Page />;
  } else if (settings?.layout === 'demo9') {
    return <Demo2Page />;
  } else if (settings?.layout === 'demo10') {
    return <Demo3Page />;
  }
}
