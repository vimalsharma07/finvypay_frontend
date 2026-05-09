'use client';

import dynamic from 'next/dynamic';
import { Route } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const RoutingEditContent = dynamic(
  () => import('./routing-edit-content').then(mod => ({ default: mod.RoutingEditContent })),
  {
    loading: () => (
      <Container>
        <Toolbar>
          <ToolbarHeading title="Edit Routing Rule" icon={Route} />
        </Toolbar>
        <div className="max-w-4xl mx-auto py-12">
          <FormSkeleton fields={6} />
        </div>
      </Container>
    ),
    ssr: false,
  }
);

export default function EditRoutingPage() {
  return (
    <RoutingEditContent />
  );
}

