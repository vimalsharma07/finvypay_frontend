'use client';

import dynamic from 'next/dynamic';
import { Users } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { FormSkeleton } from '@/components/ui/skeletons';

const CreateAffiliateContent = dynamic(
  () => import('./create-affiliate-content').then(mod => ({ default: mod.CreateAffiliateContent })),
  {
    loading: () => <FormSkeleton fields={4} />,
    ssr: false,
  }
);

export const dynamic = 'force-dynamic';

export default function CreateAffiliateUserPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Create Affiliate"
          description="Create a new affiliate user account with profile information, commission structure, and referral settings"
          icon={Users}
        />
      </Toolbar>
      <CreateAffiliateContent />
    </Container>
  );
}
