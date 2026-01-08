'use client';

import dynamic from 'next/dynamic';
import { FileText } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

const AgreementsContent = dynamic(
  () => import('./agreements-content').then(mod => ({ default: mod.AgreementsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AgreementsPage() {
  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Agreements"
            description="Create, edit, and manage legal agreements and contract templates for merchant onboarding and compliance"
            icon={FileText}
          />
        </Toolbar>
      </Container>
      <AgreementsContent />
    </Suspense>
  );
}
