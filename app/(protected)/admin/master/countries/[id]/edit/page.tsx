'use client';

import dynamic from 'next/dynamic';
import { Globe } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditCountryContent = dynamic(
  () => import('./edit-country-content').then(mod => ({ default: mod.EditCountryContent })),
  {
    loading: () => <FormSkeleton fields={11} />,
    ssr: false,
  }
);

export default function EditCountryPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Country"
          description="Update country details including country name, currency codes, currency symbols, and status settings"
          icon={Globe}
        />
      </Toolbar>
      <EditCountryContent />
    </Container>
  );
}
