'use client';

import dynamic from 'next/dynamic';
import { ShieldCheck } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const ManageRiskPageContent = dynamic(
  () => import('./manage-risk-content').then(mod => ({ default: mod.ManageRiskPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function ManageRiskPage() {
  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Manage Risk"
            description="Configure and manage risk management rules, thresholds, and fraud detection settings for transaction security"
            icon={ShieldCheck}
          />
        </Toolbar>
      </Container>
      <ManageRiskPageContent />
    </>
  );
}

