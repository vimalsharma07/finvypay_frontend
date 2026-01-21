'use client';

import dynamic from 'next/dynamic';
import { Plug, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';

const AcquirersPageContent = dynamic(
  () => import('./acquirers-content').then(mod => ({ default: mod.AcquirersPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminAcquirersPage() {
  const router = useRouter();

  const handleCreateAcquirer = () => {
    router.push('/admin/acquirers/create');
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Acquirers"
            description="Create, edit, and manage payment gateway acquirers with configuration settings and account management"
            icon={Plug}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={handleCreateAcquirer}>
              <Plus className="size-4 mr-2" />
              Create Acquirer
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <AcquirersPageContent />
    </>
  );
}

