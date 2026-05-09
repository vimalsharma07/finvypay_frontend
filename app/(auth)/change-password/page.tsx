'use client';

import dynamic from 'next/dynamic';
import { FormSkeleton } from '@/components/ui/skeletons';

const ChangePasswordContent = dynamic(
  () => import('./change-password-content').then(mod => ({ default: mod.ChangePasswordContent })),
  {
    loading: () => <FormSkeleton fields={3} />,
    ssr: false,
  }
);

export default function Page() {
  return <ChangePasswordContent />;
}
