'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { FormSkeleton } from '@/components/ui/skeletons';

const Verify2FAContent = dynamic(
  () => import('./2fa-verify-content').then(mod => ({ default: mod.Verify2FAContent })),
  {
    loading: () => <FormSkeleton fields={2} />,
    ssr: false,
  }
);

export default function Verify2FAPage() {
  return (
    <Suspense>
      <Verify2FAContent />
    </Suspense>
  );
}
