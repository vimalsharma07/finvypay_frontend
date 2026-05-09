'use client';

import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditAgreementContent = dynamic(
  () => import('./edit-agreement-content').then(mod => ({ default: mod.EditAgreementContent })),
  {
    loading: () => <FormSkeleton fields={6} />,
    ssr: false,
  }
);

export default function EditAgreementPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Agreement"
          description="Update agreement name, description, and status for compliance and merchant onboarding"
          icon={FileText}
        />
      </Toolbar>
      <EditAgreementContent />
    </Container>
  );
}
