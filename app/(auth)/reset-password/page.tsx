'use client';

import dynamic from 'next/dynamic';
import { FormSkeleton } from '@/components/ui/skeletons';

const ResetPasswordContent = dynamic(
  () => import('./reset-password-content').then(mod => ({ default: mod.ResetPasswordContent })),
  {
    loading: () => <FormSkeleton fields={3} />,
    ssr: false,
  }
);

export default function Page() {
  return <ResetPasswordContent />;
}
