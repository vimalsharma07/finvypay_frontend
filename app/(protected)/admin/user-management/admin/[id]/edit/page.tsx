'use client';

import dynamic from 'next/dynamic';
import { Shield } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditAdminContent = dynamic(
  () => import('./edit-admin-content').then(mod => ({ default: mod.EditAdminContent })),
  {
    loading: () => <FormSkeleton fields={5} />,
    ssr: false,
  }
);

export default function EditUserPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Admin"
          description="Update admin user account details including profile information, role assignment, and permissions"
          icon={Shield}
        />
      </Toolbar>
      <EditAdminContent />
    </Container>
  );
}
