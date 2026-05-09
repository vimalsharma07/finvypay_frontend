'use client';

import { Fragment, useState } from 'react';
import dynamic from 'next/dynamic';
import { Store, Plus } from 'lucide-react';
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
const MerchantUsersPageContent = dynamic(
  () => import('./merchant-users-content').then(mod => ({ default: mod.MerchantUsersPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function MerchantUsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Handle create user
  const handleCreateUser = () => {
    router.push('/admin/user-management/merchant/create');
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
            title="Merchants"
            description="Create, edit, and manage merchant accounts with profiles, payment settings, routing configurations, and transaction monitoring"
            icon={Store}
          />
          <ToolbarActions>
            <AdvancedFilter
              fields={filterFields}
              onApply={handleApplyFilters}
              onReset={handleResetFilters}
            />
            <Button variant="primary" onClick={handleCreateUser}>
              <Plus className="h-4 w-4" />
              Create Merchant
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <MerchantUsersPageContent filters={filters} />
    </Fragment>
  );
}
