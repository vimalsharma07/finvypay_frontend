'use client';

import dynamic from 'next/dynamic';
import { ShieldUser } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreateRoleContent = dynamic(
  () => import('./create-role-content').then(mod => ({ default: mod.CreateRoleContent })),
  {
    loading: () => <FormSkeleton fields={10} />,
    ssr: false,
  }
);

export default function CreateRolePage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Add Role"
          description="Create a new user role with assigned permissions for access control and security management"
          icon={ShieldUser}
        />
      </Toolbar>
      <CreateRoleContent />
    </Container>
  );
}
