'use client';

import dynamic from 'next/dynamic';
import { Key } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditPermissionContent = dynamic(
  () => import('./edit-permission-content').then(mod => ({ default: mod.EditPermissionContent })),
  {
    loading: () => <FormSkeleton fields={9} />,
    ssr: false,
  }
);

export default function EditPermissionPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Permission"
          description="Update permission name, description, and module assignment for access control management"
          icon={Key}
        />
      </Toolbar>
      <EditPermissionContent />
    </Container>
  );
}

