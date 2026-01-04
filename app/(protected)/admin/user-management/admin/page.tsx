'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Shield, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/skeletons';

// Dynamically import the heavy content
const AdminUsersPageContent = dynamic(
  () => import('./admin-users-content').then(mod => ({ default: mod.AdminUsersPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminUsersPage() {
  const router = useRouter();

  // Handle create user
  const handleCreateUser = () => {
    router.push('/admin/user-management/admin/create');
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Admins"
            description="Create, edit, and manage admin user accounts with roles, permissions, and access controls for system administration"
            icon={Shield}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={handleCreateUser}>
              <Plus className="h-4 w-4 me-1" />
              Create Admin
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <AdminUsersPageContent />
    </Fragment>
  );
}
