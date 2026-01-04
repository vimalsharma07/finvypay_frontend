'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Users, Plus } from 'lucide-react';
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
const AffiliateUsersPageContent = dynamic(
  () => import('./affiliate-users-content').then(mod => ({ default: mod.AffiliateUsersPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AffiliateUsersPage() {
  const router = useRouter();

  // Handle create user
  const handleCreateUser = () => {
    router.push('/admin/user-management/affiliate/create');
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Affiliates"
            description="Create, edit, and manage affiliate accounts with commission structures, referral tracking, and performance analytics"
            icon={Users}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={handleCreateUser}>
              <Plus className="h-4 w-4 me-1" />
              Create Affiliate
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <AffiliateUsersPageContent />
    </Fragment>
  );
}
