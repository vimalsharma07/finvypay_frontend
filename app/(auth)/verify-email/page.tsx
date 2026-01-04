'use client';

import dynamic from 'next/dynamic';
import { FormSkeleton } from '@/components/ui/skeletons';

const VerifyEmailContent = dynamic(
  () => import('./verify-email-content').then(mod => ({ default: mod.VerifyEmailContent })),
  {
    loading: () => <FormSkeleton fields={3} />,
    ssr: false,
  }
);

export default function Page() {
  return <VerifyEmailContent />;
}
