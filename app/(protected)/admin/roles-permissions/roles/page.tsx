'use client';

import dynamic from 'next/dynamic';
import { ShieldUser } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const RolesPageContent = dynamic(
  () => import('./roles-content').then(mod => ({ default: mod.RolesPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminRolesPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Roles"
          description="Create, edit, and manage user roles with assigned permissions for access control and security management"
          icon={ShieldUser}
        />
      </Toolbar>
      <RolesPageContent />
    </Container>
  );
}

