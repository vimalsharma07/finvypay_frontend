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
import { ArrowLeft, Route, BarChart3 } from 'lucide-react';

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
  const isCascading = pathname?.includes('/routing_cascading/cascading');
  const isRouting = pathname?.includes('/routing_cascading/routing') && !isCascading;

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Routing & Cascading"
            description="Manage payment routing rules and cascading configurations to optimize transaction processing across multiple acquirers"
            icon={Route}
          />
          <ToolbarActions>
            <Link href={`/admin/user-management/merchant/${userId}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to User
              </Button>
            </Link>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="flex gap-4 border-b border-border">
          <Link
            href={`${basePath}/routing`}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              isRouting
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Route className="h-4 w-4" />
            Routing
          </Link>
          <Link
            href={`${basePath}/cascading`}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              isCascading
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Cascading
          </Link>
        </div>
      </Container>
      <Container className="mt-5">{children}</Container>
    </>
  );
}

