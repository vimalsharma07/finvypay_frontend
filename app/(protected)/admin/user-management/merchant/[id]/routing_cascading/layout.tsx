'use client';

import { ReactNode } from 'react';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Route, BarChart3, Landmark } from 'lucide-react';

interface RoutingCascadingLayoutProps {
  children: ReactNode;
}

export default function RoutingCascadingLayout({
  children,
}: RoutingCascadingLayoutProps) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params.id as string;

  const basePath = `/admin/user-management/merchant/${userId}/routing_cascading`;
  const isAcquirerAccounts = pathname?.includes('/routing_cascading/acquirer-accounts');
  const isCascading = pathname?.includes('/routing_cascading/cascading');
  const isRouting = pathname?.includes('/routing_cascading/routing') && !pathname?.includes('/cascading');

  const tabClass = (active: boolean) =>
    `flex items-center gap-1 px-4 py-2 border-b-2 transition-colors ${
      active
        ? 'border-primary text-primary font-medium'
        : 'border-transparent text-muted-foreground hover:text-foreground'
    }`;

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Routing & Cascading"
            description="Manage acquirer accounts, payment routing rules, and cascading configurations to optimize transaction processing"
            icon={Route}
          />
          <ToolbarActions>
            <Link href="/admin/user-management/merchant">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to User
              </Button>
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="flex flex-wrap gap-2 border-b border-border">
          <Link href={`${basePath}/acquirer-accounts`} className={tabClass(isAcquirerAccounts)}>
            <Landmark className="h-4 w-4" />
            Acquirer Accounts
          </Link>
          <Link href={`${basePath}/routing`} className={tabClass(isRouting)}>
            <Route className="h-4 w-4" />
            Routing
          </Link>
          <Link href={`${basePath}/cascading`} className={tabClass(isCascading)}>
            <BarChart3 className="h-4 w-4" />
            Cascading
          </Link>
        </div>
      </Container>
      <Container className="mt-5">{children}</Container>
    </>
  );
}

