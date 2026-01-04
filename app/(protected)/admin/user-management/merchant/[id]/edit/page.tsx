'use client';

import dynamic from 'next/dynamic';
import { Store } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditMerchantContent = dynamic(
  () => import('./edit-merchant-content').then(mod => ({ default: mod.EditMerchantContent })),
  {
    loading: () => <FormSkeleton fields={5} />,
    ssr: false,
  }
);

export default function EditMerchantUserPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Merchant"
          description="Update merchant account details including profile information, payment settings, and configuration"
          icon={Store}
        />
      </Toolbar>
      <EditMerchantContent />
    </Container>
  );
}
