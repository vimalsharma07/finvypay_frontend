'use client';

import dynamic from 'next/dynamic';
import { Mail } from 'lucide-react';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense } from 'react';

const SmtpPageContent = dynamic(
  () => import('./smtp-content').then((mod) => ({ default: mod.SmtpPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminSmtpPage() {
  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="SMTP"
            description="View live SMTP credentials and send a dummy test email to verify outbound mail"
            icon={Mail}
          />
        </Toolbar>
      </Container>
      <SmtpPageContent />
    </Suspense>
  );
}
