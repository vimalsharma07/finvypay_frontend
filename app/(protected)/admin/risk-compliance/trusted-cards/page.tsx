'use client';

import dynamic from 'next/dynamic';
import { CreditCard } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const TrustedCardsPageContent = dynamic(
  () => import('./trusted-cards-content').then(mod => ({ default: mod.TrustedCardsPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function TrustedCardsPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="Trusted Cards"
          description="Manage trusted card whitelist entries to bypass fraud checks for verified and trusted payment cards"
          icon={CreditCard}
        />
      </Toolbar>
      <TrustedCardsPageContent />
    </Container>
  );
}

