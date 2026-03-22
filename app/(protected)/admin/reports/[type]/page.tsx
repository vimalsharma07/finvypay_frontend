'use client';

import { use, useState } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3, Filter } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import {
  ADMIN_REPORT_BY_SLUG,
  VALID_REPORT_SLUGS,
} from '@/config/reports/admin-report-types';

const ReportContent = dynamic(
  () =>
    import('../_components/report-content').then((mod) => ({
      default: mod.ReportContent,
    })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

interface ReportPageProps {
  params: Promise<{ type: string }>;
}

export default function ReportPage({ params }: ReportPageProps) {
  const { type } = use(params);
  const [filterOpen, setFilterOpen] = useState(false);
  const config = ADMIN_REPORT_BY_SLUG[type];

  if (!config || !VALID_REPORT_SLUGS.has(type)) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h2 className="text-xl font-semibold">Report not found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The report type &quot;{type}&quot; does not exist.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={config.title}
            description={config.description}
            icon={BarChart3}
          />
          <ToolbarActions>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setFilterOpen(true)}
            >
              <Filter className="h-4 w-4" />
              Advanced Filter
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <ReportContent
          config={config}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
        />
      </Container>
    </div>
  );
}
