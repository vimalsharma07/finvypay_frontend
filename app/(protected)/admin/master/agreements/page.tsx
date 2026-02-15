'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { FileText, Plus } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/ui/skeletons';

const AgreementsContent = dynamic(
  () => import('./agreements-content').then(mod => ({ default: mod.AgreementsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AgreementsPage() {
  const router = useRouter();

  const handleCreateAgreement = () => {
    router.push('/admin/master/agreements/create');
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Agreements"
            description="Create, edit, and manage legal agreements and contract templates for merchant onboarding and compliance"
            icon={FileText}
          />
          <ToolbarActions>
            <Button variant="primary" onClick={handleCreateAgreement}>
              <Plus className="h-4 w-4" />
              Create Agreement
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <AgreementsContent />
    </Fragment>
  );
}
