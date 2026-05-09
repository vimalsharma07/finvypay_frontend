'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { Shield, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PageSkeleton } from '@/components/ui/skeletons';
import { AdvancedFilter, FilterField } from '@/app/(protected)/components/advanced-filter';

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
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Handle create user
  const handleCreateUser = () => {
    router.push('/admin/user-management/admin/create');
  };

  // Define filter fields
  const filterFields: FilterField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'text-search',
      placeholder: 'Search by name',
    },
    {
      key: 'email',
      label: 'Email',
      type: 'select-search',
      placeholder: 'Select email...',
      options: [
        { label: 'user1@example.com', value: 'user1@example.com' },
        { label: 'user2@example.com', value: 'user2@example.com' },
      ],
    },
  ];

  // Handle filter apply
  const handleApplyFilters = (appliedFilters: Record<string, string>) => {
    setFilters(appliedFilters);
  };

  // Handle filter reset
  const handleResetFilters = () => {
    setFilters({});
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
            <AdvancedFilter
              fields={filterFields}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
            <Button variant="primary" onClick={handleCreateUser}>
              <Plus className="h-4 w-4 me-1" />
              Create Admin
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <AdminUsersPageContent filters={filters} />
    </Fragment>
  );
}
