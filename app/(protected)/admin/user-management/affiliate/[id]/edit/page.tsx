'use client';

import dynamic from 'next/dynamic';
import { Users } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const EditAffiliateContent = dynamic(
  () => import('./edit-affiliate-content').then(mod => ({ default: mod.EditAffiliateContent })),
  {
    loading: () => <FormSkeleton fields={5} />,
    ssr: false,
  }
);

export default function EditAffiliateUserPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Edit Affiliate"
          description="Update affiliate account details including profile information, commission structure, and referral settings"
          icon={Users}
        />
      </Toolbar>
      <EditAffiliateContent />
    </Container>
  );
}
