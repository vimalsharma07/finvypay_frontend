'use client';

import dynamic from 'next/dynamic';
import { Network } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';

const IpAllowlistPageContent = dynamic(
  () => import('./ip-allowlist-content').then(mod => ({ default: mod.IpAllowlistPageContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminIpWhitelistPage() {
  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="IP Whitelist"
            description="Add, edit, and manage IP address whitelist entries for secure access control and fraud prevention"
            icon={Network}
          />
        </Toolbar>
      </Container>
      <IpAllowlistPageContent />
    </>
  );
}

