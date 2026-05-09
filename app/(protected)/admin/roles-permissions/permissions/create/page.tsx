'use client';

import dynamic from 'next/dynamic';
import { Key } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreatePermissionContent = dynamic(
  () => import('./create-permission-content').then(mod => ({ default: mod.CreatePermissionContent })),
  {
    loading: () => <FormSkeleton fields={9} />,
    ssr: false,
  }
);

export default function CreatePermissionPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Add Permission"
          description="Create a new system permission that can be assigned to roles for granular access control"
          icon={Key}
        />
      </Toolbar>
      <CreatePermissionContent />
    </Container>
  );
}

