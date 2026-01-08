'use client';

import dynamic from 'next/dynamic';
import { Coins } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

const CurrencyContent = dynamic(
  () => import('./currency-content').then(mod => ({ default: mod.CurrencyPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function CurrencyPage() {
  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Currency"
            description="View and manage all currency codes, exchange rates, and their values for multi-currency transaction processing"
            icon={Coins}
          />
        </Toolbar>
      </Container>
      <CurrencyContent />
    </Suspense>
  );
}
