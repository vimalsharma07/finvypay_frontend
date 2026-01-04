'use client';

import dynamic from 'next/dynamic';
import { Network } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const UserIpAllowlistPageContent = dynamic(
  () => import('./ip-allowlist-content').then(mod => ({ default: mod.UserIpAllowlistPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function UserIpAllowlistPage() {
  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title="IP Allowlist"
          description="Add and manage IP address allowlist entries for secure access control and enhanced security"
          icon={Network}
        />
      </Toolbar>
      <UserIpAllowlistPageContent />
    </Container>
  );
}

