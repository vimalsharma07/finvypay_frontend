'use client';

import { Fragment } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';

// Dynamically import to avoid SSR issues
const DashboardContent = dynamic(
  () => import('@/app/(protected)/store-admin/dashboard/content').then(mod => ({ default: mod.DashboardContent })),
  { ssr: false }
);

export default function DashboardPage() {
  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              Sales, inventory, and activity overview
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline">
              <Link href="#">Reports</Link>
            </Button>
            <Button>
              <Link href="#">New Product</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <DashboardContent />
      </Container>
    </Fragment>
  );
}
