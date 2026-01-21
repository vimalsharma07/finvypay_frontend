'use client';

import dynamic from 'next/dynamic';
import { ShieldUser } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditRoleContent = dynamic(
  () => import('./edit-role-content').then(mod => ({ default: mod.EditRoleContent })),
  {
    loading: () => <FormSkeleton fields={10} />,
    ssr: false,
  }
);

export default function EditRolePage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Role"
          description="Update role name, description, and assigned permissions for access control and security management"
          icon={ShieldUser}
        />
      </Toolbar>
      <EditRoleContent />
    </Container>
  );
}

