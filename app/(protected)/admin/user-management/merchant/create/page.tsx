'use client';

import dynamic from 'next/dynamic';
import { Store } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreateMerchantContent = dynamic(
  () => import('./create-merchant-content').then(mod => ({ default: mod.CreateMerchantContent })),
  {
    loading: () => <FormSkeleton fields={4} />,
    ssr: false,
  }
);

export default function CreateMerchantUserPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Merchant"
          description="Create a new merchant account with profile information, payment settings, and initial configuration"
          icon={Store}
        />
      </Toolbar>
      <CreateMerchantContent />
    </Container>
  );
}
