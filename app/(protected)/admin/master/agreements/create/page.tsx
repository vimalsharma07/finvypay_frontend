'use client';

import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreateAgreementContent = dynamic(
  () => import('./create-agreement-content').then(mod => ({ default: mod.CreateAgreementContent })),
  {
    loading: () => <FormSkeleton fields={6} />,
    ssr: false,
  }
);

export default function CreateAgreementPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Agreement"
          description="Add a new legal agreement or contract template for merchant onboarding and compliance"
          icon={FileText}
        />
      </Toolbar>
      <CreateAgreementContent />
    </Container>
  );
}
