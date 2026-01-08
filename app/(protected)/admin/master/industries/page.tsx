'use client';

import dynamic from 'next/dynamic';
import { Building } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

const IndustriesContent = dynamic(
  () => import('./industries-content').then(mod => ({ default: mod.IndustriesPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function IndustriesPage() {
  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Industries"
            description="Create, edit, and manage industry categories for merchant classification and organization"
            icon={Building}
          />
        </Toolbar>
      </Container>
      <IndustriesContent />
    </Suspense>
  );
}
