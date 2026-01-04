'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Store, Plus } from 'lucide-react';
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
const MerchantUsersPageContent = dynamic(
  () => import('./merchant-users-content').then(mod => ({ default: mod.MerchantUsersPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function MerchantUsersPage() {
  const router = useRouter();

  // Handle create user
  const handleCreateUser = () => {
    router.push('/admin/user-management/merchant/create');
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
            <Button variant="primary" onClick={handleCreateUser}>
              <Plus className="h-4 w-4" />
              Create Merchant
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <MerchantUsersPageContent />
    </Fragment>
  );
}
