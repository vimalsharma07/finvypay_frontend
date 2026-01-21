'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Link2 } from 'lucide-react';
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
import { getUserCascadingById, type CascadingRule } from '@/lib/services/admin/cascading';
import { handleApiResponse } from '@/lib/utils/api-response-handler';

type NormalizedCascade = {
  id?: string;
  name?: string;
  type?: string;
  status?: boolean;
  priority?: number | null;
  cascadingFor?: number | null;
  merchantProfileId?: string | number | null;
  merchantAcquirerAccountId?: string | number | null;
  connectorName?: string | null;
  connectorDescription?: string | null;
  currencyCode?: string | null;
  config: Array<{ merchantAcquirerAccountId: string; merchantAcquirerAccountName: string }>;
  createdAt?: string;
  updatedAt?: string;
};

function normalizeCascade(data: any): NormalizedCascade {
  if (!data) return { config: [] };
  return {
    id: data.id,
    name: data.name,
    type: data.type,
    status: data.status,
    priority: data.priority ?? null,
    cascadingFor: data.cascadingFor ?? data.cascading_for ?? null,
    merchantProfileId: data.merchantProfileId ?? data.merchant_profile_id ?? null,
    merchantAcquirerAccountId:
      data.merchantAcquirerAccountId ??
      data.connectorId ??
      data.connector_id ??
      data.merchant_acquirer_account_id ??
      null,
    connectorName: data.connector?.name ?? data.connector_name ?? null,
    connectorDescription: data.connector?.description ?? null,
    currencyCode: data.connector?.currencyCode ?? null,
    config: Array.isArray(data.config)
      ? data.config.map((c: any) => ({
          merchantAcquirerAccountId: c.merchantAcquirerAccountId?.toString() || '',
          merchantAcquirerAccountName: c.merchantAcquirerAccountName || '',
        }))
      : [],
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export default function CascadingViewPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const cascadingId = params.cascadingId as string;

  const [loading, setLoading] = useState(true);
  const [cascade, setCascade] = useState<NormalizedCascade | null>(null);

  const backUrl = useMemo(
    () =>
      `/admin/user-management/merchant/${userId}/routing_cascading/cascading`,
    [userId],
  );

  useEffect(() => {
    const loadCascade = async () => {
      if (!userId || !cascadingId) return;
      setLoading(true);
      try {
        const response = await getUserCascadingById(userId, cascadingId);
        handleApiResponse(response, {
          onSuccess: (payload) => {
            const data = (payload as any)?.data ?? payload;
            const normalized = normalizeCascade(data);
            setCascade(normalized);
          },
          onError: (errorMessage) => {
            toast.error(errorMessage || 'Failed to load cascading detail');
          },
        });
      } catch (error) {
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadCascade();
  }, [userId, cascadingId]);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center py-12">
          <ContentLoader />
        </div>
      </Container>
    );
  }

  if (!cascade) {
    return (
      <Container>
        <div className="flex flex-col gap-4 py-12 items-center text-muted-foreground">
          <p>No cascading detail found.</p>
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
          title={cascade.name || 'Cascading Detail'}
          description={`Review complete cascading rule configuration including acquirer chain sequence, priorities, status, and fallback settings for ${cascade.name || 'this rule'}`}
          icon={Link2}
        />
        <div className="flex items-center gap-2">
          <Link href={`${backUrl}/${cascadingId}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button variant="secondary" onClick={() => router.push(backUrl)}>
            Back
          </Button>
        </div>
      </Toolbar>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Name" value={cascade.name} />
              <InfoItem label="Type" value={cascade.type} badge />
              <InfoItem
                label="Status"
                value={cascade.status ? 'Enabled' : 'Disabled'}
                badge
                badgeVariant={cascade.status ? 'success' : 'secondary'}
              />
              <InfoItem label="Priority" value={cascade.priority ?? '-'} />
              <InfoItem label="Cascading For" value={cascade.cascadingFor ?? '-'} />
              <InfoItem label="Merchant Profile ID" value={cascade.merchantProfileId ?? '-'} />
              <InfoItem label="Primary Connector ID" value={cascade.merchantAcquirerAccountId ?? '-'} />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm font-semibold">Cascade Chain</p>
              {cascade.config.length === 0 ? (
                <p className="text-sm text-muted-foreground">No connectors configured.</p>
              ) : (
                <div className="space-y-2">
                  {cascade.config.map((cfg, idx) => (
                    <div
                      key={`${cfg.merchantAcquirerAccountId}-${idx}`}
                      className="rounded-md border px-3 py-2 text-sm flex items-center justify-between"
                    >
                      <span className="text-muted-foreground">
                        {cfg.merchantAcquirerAccountName || 'Connector'} (ID: {cfg.merchantAcquirerAccountId})
                      </span>
                      <Badge variant="secondary">#{idx + 1}</Badge>
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
            <InfoItem label="Name" value={cascade.connectorName || 'Not assigned'} />
            <InfoItem label="Description" value={cascade.connectorDescription || '-'} />
            <InfoItem label="Currency" value={cascade.currencyCode || '-'} />
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
      <p className="text-xs uppercase text-muted-foreground tracking-wide">{label}</p>
      {badge ? (
        <Badge variant={badgeVariant} className="w-fit">
          {display}
        </Badge>
      ) : (
        <p className="text-sm text-foreground break-words">{display}</p>
      )}
    </div>
  );
}

