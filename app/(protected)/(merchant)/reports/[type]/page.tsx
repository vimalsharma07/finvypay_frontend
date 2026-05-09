'use client';

import { use } from 'react';
import dynamic from 'next/dynamic';
import { BarChart3 } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import {
  MERCHANT_REPORT_BY_SLUG,
  VALID_MERCHANT_REPORT_SLUGS,
} from '@/config/reports/merchant-report-types';

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
  const config = MERCHANT_REPORT_BY_SLUG[type];

  if (!config || !VALID_MERCHANT_REPORT_SLUGS.has(type)) {
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
          <ToolbarActions />
        </Toolbar>
      </Container>
      <Container>
        <ReportContent config={config} />
      </Container>
    </div>
  );
}
