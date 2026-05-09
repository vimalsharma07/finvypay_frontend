'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Users, CheckCircle2, ArrowLeft } from 'lucide-react';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/main/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import {
  getAffiliateApplicationById,
  approveAffiliateApplication,
  type AffiliateApplication,
} from '@/lib/services/admin/applications';
import { toast } from 'sonner';

const DATE_FMT = 'yyyy-MM-dd HH:mm';

function FileLink({
  path,
  label,
}: {
  path: string | null;
  label: string;
}) {
  if (!path) return <span className="text-muted-foreground">Not uploaded</span>;
  const href = path.startsWith('http') ? path : path;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline"
    >
      {label}
    </a>
  );
}

export default function AdminAffiliateApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string | undefined;

  const [data, setData] = useState<AffiliateApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await getAffiliateApplicationById(id);
      handleApiResponse(response, {
        onSuccess: (body) => {
          if (body?.success && body.data) {
            setData(body.data);
          } else {
            toast.error('Failed to load application detail');
          }
        },
        onError: (message) => {
          toast.error(message || 'Failed to load application detail');
        },
        silent: true,
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleApprove = async () => {
    if (!id) return;
    setApproving(true);
    try {
      const response = await approveAffiliateApplication(id);
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res?.success) {
            toast.success('Affiliate application approved');
            router.push('/admin/applications/affiliate');
          } else {
            toast.error(res?.message || 'Failed to approve');
          }
        },
        onError: (message) => toast.error(message || 'Failed to approve'),
      });
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setApproving(false);
    }
  };

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Affiliate Application Details"
            description={
              data
                ? `Application from ${data.rpName || data.user?.name || 'Affiliate'}`
                : `Application ID: ${id || '—'}`
            }
            icon={Users}
          />
          <ToolbarActions>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/applications/affiliate" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to list
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading...
          </div>
        ) : !data ? (
          <div className="text-center py-10 text-muted-foreground">
            Application not found
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Applicant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{data.rpName || data.user?.name || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{data.email || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">
                    {[data.phoneCountryCode, data.phoneNumber].filter(Boolean).join(' ') || '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium">{data.country || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="uppercase">
                    {data.status || '—'}
                  </Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">
                    {data.createdAt
                      ? format(new Date(data.createdAt), DATE_FMT)
                      : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-muted-foreground">Proof of Identity (POI)</span>
                  <FileLink path={data.poiPath} label="View" />
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-muted-foreground">Proof of Address (POA)</span>
                  <FileLink path={data.poaPath} label="View" />
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-muted-foreground">Signed Agreement</span>
                  <FileLink path={data.signedAgreementPath} label="View" />
                </div>
                {data.agreement && (
                  <div className="flex justify-between gap-4 items-center">
                    <span className="text-muted-foreground">Agreement</span>
                    <span className="font-medium">{data.agreement.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {data.agreement?.desc && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Agreement (Reference)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[320px] w-full rounded-md border p-4">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: data.agreement.desc }}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {data.status === 'pending' && (
              <Card className="lg:col-span-2">
                <CardContent className="pt-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <Button
                      variant="primary"
                      onClick={handleApprove}
                      disabled={approving}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {approving ? 'Approving...' : 'Approve application'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </Container>
    </Fragment>
  );
}
