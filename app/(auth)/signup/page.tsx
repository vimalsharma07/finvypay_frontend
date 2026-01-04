'use client';

import dynamic from 'next/dynamic';
import { FormSkeleton } from '@/components/ui/skeletons';

const SignupContent = dynamic(
  () => import('./signup-content').then(mod => ({ default: mod.SignupContent })),
  {
    loading: () => <FormSkeleton fields={5} />,
    ssr: false,
  }
);

export default function Page() {
  return <SignupContent />;
}
