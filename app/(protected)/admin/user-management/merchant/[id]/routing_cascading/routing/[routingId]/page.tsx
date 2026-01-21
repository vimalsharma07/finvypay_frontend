'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Route } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/layouts/main/components/toolbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ContentLoader } from '@/components/common/content-loader';
import { toast } from 'sonner';
import {
  getUserRoutingById,
  type RouteRule,
} from '@/lib/services/admin/routing';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

type NormalizedRoute = {
  name: string;
  priority: number | string;
  viewRoute: string;
  routingFor: string;
  status: boolean;
  isCascade: boolean;
  splitEnable: boolean;
  splitType?: string | null;
  isSuccessTransaction?: boolean;
  config: Array<{
    value: any;
    category?: string;
    operator?: string;
  }>;
  connectorName?: string;
  connectorDescription?: string | null;
  currencyCode?: string | null;
};

function normalizeRoute(route?: RouteRule | null): NormalizedRoute | null {
  if (!route) return null;
  return {
    name: route.name,
    priority: route.priority,
    viewRoute: (route as any).viewRoute ?? (route as any).view_route ?? '',
    routingFor: route.routing_for ?? (route as any).routingFor ?? '',
    status: route.status,
    isCascade: route.is_cascade ?? (route as any).isCascade ?? false,
    splitEnable: route.split_enable ?? (route as any).splitEnable ?? false,
    splitType: route.split_type ?? (route as any).splitType,
    isSuccessTransaction:
      route.is_success_transaction ?? (route as any).isSuccessTransaction,
    config: Array.isArray(route.config) ? route.config : [],
    connectorName: route.merchantConnector?.name,
    connectorDescription: (route as any).merchantConnector?.description,
    currencyCode: (route as any).merchantConnector?.currencyCode,
  };
}

export default function RoutingViewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const routingId = params.routingId as string;

  const [loading, setLoading] = useState(true);
  const [routeDetail, setRouteDetail] = useState<NormalizedRoute | null>(null);

  const backUrl = useMemo(
    () =>
      `/admin/user-management/merchant/${userId}/routing_cascading/routing`,
    [userId],
  );

  useEffect(() => {
    const fetchDetail = async () => {
      if (!userId || !routingId) return;
      setLoading(true);
      try {
        const response = await getUserRoutingById(userId, routingId);
        handleApiResponse(response, {
          onSuccess: (payload) => {
            const route = (payload as any)?.data ?? null;
            const normalized = normalizeRoute(route);
            setRouteDetail(normalized);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load routing detail');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [userId, routingId]);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center py-12">
          <ContentLoader />
        </div>
      </Container>
    );
  }

  if (!routeDetail) {
    return (
      <Container>
        <div className="flex flex-col gap-4 py-12 items-center text-muted-foreground">
          <p>No routing detail found.</p>
          <Button variant="outline" onClick={() => router.push(backUrl)}>
            Go Back
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Toolbar>
        <ToolbarHeading
          title={routeDetail.name || 'Routing Detail'}
          description={`Review complete routing rule configuration including conditions, priorities, connector assignments, and status for ${routeDetail.name || 'this rule'}`}
          icon={Route}
        />
        <ToolbarActions>
          <Link href={`${backUrl}/${routingId}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="secondary" onClick={() => router.push(backUrl)}>
            Back
          </Button>
        </ToolbarActions>
      </Toolbar>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Routing Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Name" value={routeDetail.name} />
              <InfoItem label="Priority" value={routeDetail.priority} />
              <InfoItem
                label="Route Handler"
                value={routeDetail.routingFor}
                badge
              />
              <InfoItem
                label="Status"
                value={routeDetail.status ? 'Active' : 'Inactive'}
                badge
                badgeVariant={routeDetail.status ? 'success' : 'secondary'}
              />
              <InfoItem
                label="Cascade"
                value={routeDetail.isCascade ? 'Enabled' : 'Disabled'}
                badge
                badgeVariant={routeDetail.isCascade ? 'success' : 'secondary'}
              />
              <InfoItem
                label="Split"
                value={routeDetail.splitEnable ? 'Enabled' : 'Disabled'}
                badge
                badgeVariant={routeDetail.splitEnable ? 'success' : 'secondary'}
              />
              {routeDetail.splitType && (
                <InfoItem label="Split Type" value={routeDetail.splitType} />
              )}
              <InfoItem label="View Route" value={routeDetail.viewRoute} />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-semibold">Conditions</p>
              {routeDetail.config.length === 0 ? (
                <p className="text-sm text-muted-foreground">No conditions</p>
              ) : (
                <div className="space-y-2">
                  {routeDetail.config.map((item, idx) => (
                    <div
                      key={`${item.category}-${idx}`}
                      className="rounded-md border px-3 py-2 text-sm flex items-center justify-between"
                    >
                      <span className="text-muted-foreground capitalize">
                        {item.category || 'category'}
                      </span>
                      <span className="font-semibold">
                        {item.operator || ''} {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <InfoItem
              label="Name"
              value={routeDetail.connectorName || 'Not assigned'}
            />
            <InfoItem
              label="Description"
              value={routeDetail.connectorDescription || '-'}
            />
            <InfoItem
              label="Currency"
              value={routeDetail.currencyCode || '-'}
            />
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function InfoItem({
  label,
  value,
  badge = false,
  badgeVariant = 'secondary',
}: {
  label: string;
  value: any;
  badge?: boolean;
  badgeVariant?: 'secondary' | 'success' | 'outline';
}) {
  const display = value ?? '-';
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs uppercase text-muted-foreground tracking-wide">
        {label}
      </p>
      {badge ? (
        <Badge variant={badgeVariant} className="w-fit">
          {display}
        </Badge>
      ) : (
        <p className="text-sm text-foreground">{display}</p>
      )}
    </div>
  );
}

