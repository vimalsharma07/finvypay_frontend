'use client';

import dynamic from 'next/dynamic';
import { Key } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const PermissionsPageContent = dynamic(
  () => import('./permissions-content').then(mod => ({ default: mod.PermissionsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminPermissionsPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Permissions"
          description="View and manage system permissions that can be assigned to roles for granular access control and security"
          icon={Key}
        />
      </Toolbar>
      <PermissionsPageContent />
    </Container>
  );
}

