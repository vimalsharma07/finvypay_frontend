'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import { Users } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const AffiliateMerchantContent = dynamic(
  () =>
    import('./merchant-content').then((mod) => ({
      default: mod.AffiliateMerchantContent,
    })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AffiliateMerchantPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Merchant Users"
            description="View merchants referred by your affiliate account"
            icon={Users}
          />
        </Toolbar>
      </Container>
      <AffiliateMerchantContent />
    </Fragment>
  );
}
