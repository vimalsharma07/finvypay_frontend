'use client';

import dynamic from 'next/dynamic';
import { Globe } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreateCountryContent = dynamic(
  () => import('./create-country-content').then(mod => ({ default: mod.CreateCountryContent })),
  {
    loading: () => <FormSkeleton fields={11} />,
    ssr: false,
  }
);

export default function CreateCountryPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Country"
          description="Add a new country with country name, currency code, currency symbol, and status configuration for merchant onboarding"
          icon={Globe}
        />
      </Toolbar>
      <CreateCountryContent />
    </Container>
  );
}
