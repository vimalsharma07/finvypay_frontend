'use client';

import dynamic from 'next/dynamic';
import { ShieldUser, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';

const RolesPageContent = dynamic(
  () => import('./roles-content').then(mod => ({ default: mod.RolesPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminRolesPage() {
  const router = useRouter();

  const handleCreateRole = () => {
    router.push('/admin/roles-permissions/roles/create');
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Roles"
            description="Create, edit, and manage user roles with assigned permissions for access control and security management"
            icon={ShieldUser}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={handleCreateRole}>
              <Plus className="h-4 w-4" />
              Create Role
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <RolesPageContent />
    </>
  );
}

