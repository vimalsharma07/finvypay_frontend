'use client';

import dynamic from 'next/dynamic';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditMerchantAcquirerAccountContent = dynamic(
  () => import('./edit-merchant-acquirer-account-content').then(mod => ({ default: mod.EditMerchantAcquirerAccountContent })),
  {
    loading: () => <FormSkeleton fields={15} />,
    ssr: false,
  }
);

export default function AdminMerchantAcquirerAccountEditPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Merchant Acquirer Account"
          description="Update merchant acquirer account details, status, and rate structure"
        />
      </Toolbar>
      <EditMerchantAcquirerAccountContent />
    </Container>
  );
}
