'use client';

import dynamic from 'next/dynamic';
import { Key, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';

const PermissionsPageContent = dynamic(
  () => import('./permissions-content').then(mod => ({ default: mod.PermissionsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminPermissionsPage() {
  const router = useRouter();

  const handleCreatePermission = () => {
    router.push('/admin/roles-permissions/permissions/create');
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Permissions"
            description="View and manage system permissions that can be assigned to roles for granular access control and security"
            icon={Key}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={handleCreatePermission}>
              <Plus className="h-4 w-4" />
              Create Permission
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <PermissionsPageContent />
    </>
  );
}

