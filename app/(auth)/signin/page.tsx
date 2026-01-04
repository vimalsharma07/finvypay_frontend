'use client';

import dynamic from 'next/dynamic';
import { FormSkeleton } from '@/components/ui/skeletons';

const SigninContent = dynamic(
  () => import('./signin-content').then(mod => ({ default: mod.SigninContent })),
  {
    loading: () => <FormSkeleton fields={5} />,
    ssr: false,
  }
);

export default function Page() {
  return <SigninContent />;
}
