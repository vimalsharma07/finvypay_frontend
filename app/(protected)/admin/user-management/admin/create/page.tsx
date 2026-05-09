'use client';

import dynamic from 'next/dynamic';
import { Shield } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreateAdminContent = dynamic(
  () => import('./create-admin-content').then(mod => ({ default: mod.CreateAdminContent })),
  {
    loading: () => <FormSkeleton fields={4} />,
    ssr: false,
  }
);

export default function CreateUserPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Admin"
          description="Create a new admin user account with profile information, role assignment, and access permissions"
          icon={Shield}
        />
      </Toolbar>
      <CreateAdminContent />
    </Container>
  );
}
