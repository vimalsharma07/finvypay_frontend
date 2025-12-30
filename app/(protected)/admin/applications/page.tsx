'use client';

import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Toolbar,
  ToolbarHeading,
} from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getApplicationCounts, ApplicationCounts } from '@/lib/services/admin/applications';
import { ClipboardList, Clock3 } from 'lucide-react';
import { toast } from 'sonner';

const cardsConfig = [
  {
    key: 'applicationCount' as const,
    title: 'Total Applications',
    description: 'All merchant applications submitted',
    href: '/admin/applications/all',
    icon: ClipboardList,
  },
  {
    key: 'merchantAcquirerRequestPendingCount' as const,
    title: 'Pending Acquirer Requests',
    description: 'Merchants waiting for acquirer mapping',
    href: '/admin/acquirers/acquirer-accounts',
    icon: Clock3,
  },
];

export default function AdminApplicationsPage() {
  const [counts, setCounts] = useState<ApplicationCounts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const response = await getApplicationCounts();
        handleApiResponse(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setCounts(data.data);
            } else {
              toast.error('Failed to load application counts');
            }
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load application counts');
          },
          silent: true,
        });
      } catch (error) {
        toast.error('An unexpected error occurred while fetching counts');
        console.error('Application counts fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Applications"
            description="Overview of merchant applications and acquirer requests"
          />
        </Toolbar>
      </Container>

      <Container>
        <div className="grid gap-6 md:grid-cols-2">
          {cardsConfig.map((card) => {
            const Icon = card.icon;
            const value = counts?.[card.key] ?? 0;

            return (
              <Link key={card.key} href={card.href} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">{card.title}</CardTitle>
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-3xl font-semibold">
                      {loading ? '—' : value}
                    </div>
                    <CardDescription>{card.description}</CardDescription>
                    <div className="pt-1">
                      <Button variant="link" className="px-0 text-primary">
                        View details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </Fragment>
  );
}


