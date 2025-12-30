'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Toolbar, ToolbarHeading } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getApplicationDetail, ApplicationDetailResponse } from '@/lib/services/admin/applications';
import { toast } from 'sonner';

const DATE_FMT = 'yyyy-MM-dd HH:mm';

const buildFileUrl = (path: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Use public envs (client component). Ensure NEXT_PUBLIC_AWS_BASE_URL is set in env.
  const base = process.env.NEXT_PUBLIC_AWS_BASE_URL || process.env.NEXT_PUBLIC_S3_BASE_URL || process.env.AWS_BASE_URL || '';
  return `${base}${path}`;
};

function FileLink({ path, label }: { path: string | null; label: string }) {
  const href = buildFileUrl(path);
  if (!href) return <span className="text-muted-foreground">Not uploaded</span>;
  return (
    <Link href={href} target="_blank" className="text-primary underline">
      {label}
    </Link>
  );
}

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const merchantId = params?.id as string | undefined;

  const [data, setData] = useState<ApplicationDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);

  const directors = data?.onboarding?.directors || [];

  const fetchDetail = async () => {
    if (!merchantId) return;
    setLoading(true);
    try {
      const response = await getApplicationDetail(merchantId);
      handleApiResponse(response, {
        onSuccess: (res) => {
          if (res && res.success && res.data) {
            setData(res.data);
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
      console.error('Application detail fetch error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantId]);

  const acceptedPayments = useMemo(
    () => data?.onboarding?.acceptedPaymentMethods?.join(', ') || '—',
    [data?.onboarding?.acceptedPaymentMethods]
  );

  const processingCurrencies = useMemo(
    () => data?.onboarding?.processingCurrency?.join(', ') || '—',
    [data?.onboarding?.processingCurrency]
  );

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Application Details"
            description={`Application ID: ${data?.onboarding?.id || merchantId || ''}`}
          />
        </Toolbar>
      </Container>

      <Container>
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : !data ? (
          <div className="text-center py-10 text-muted-foreground">No data</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Applicant</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium">{data.onboarding.name || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{data.onboarding.email || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium">{data.onboarding.phoneNumber || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Entity Type</span>
                  <Badge variant="outline" className="uppercase">{data.user.entityType || '—'}</Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">KYC Status</span>
                  <Badge variant="outline" className="uppercase">{data.user.kycStatus || '—'}</Badge>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Profile Step</span>
                  <span className="font-medium">{data.user.profileStep ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Address</span>
                  <span className="font-medium text-right">{data.onboarding.address || '—'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Registration #</span>
                  <span className="font-medium">{data.onboarding.registrationNumber || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Doing Business As</span>
                  <span className="font-medium">{data.onboarding.doingBusinessAs || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Website</span>
                  <Link href={data.onboarding.companyWebsite || '#'} target="_blank" className="text-primary underline">
                    {data.onboarding.companyWebsite || '—'}
                  </Link>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Incorporation Date</span>
                  <span className="font-medium">
                    {data.onboarding.dateOfIncorporation
                      ? format(new Date(data.onboarding.dateOfIncorporation), 'yyyy-MM-dd')
                      : '—'}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Country of Incorporation</span>
                  <span className="font-medium">{data.onboarding.countryOfIncorporation?.countryName || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Registered Address</span>
                  <span className="font-medium text-right">{data.onboarding.registeredAddress || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Accepted Payments</span>
                  <span className="font-medium text-right">{acceptedPayments}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium">{data.onboarding.industry?.name || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Processing Country</span>
                  <span className="font-medium">{data.onboarding.processingCountry?.countryName || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Processing Currency</span>
                  <span className="font-medium">{processingCurrencies}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Monthly Volume</span>
                  <span className="font-medium">{data.onboarding.monthlyVolume || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">License Status</span>
                  <Badge variant="outline">{data.onboarding.licenseStatus ? 'Yes' : 'No'}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Documents</CardTitle>
                <Button size="sm" variant="ghost" onClick={fetchDetail}>Refresh</Button>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Certificate of Incorporation</span>
                  <FileLink path={data.onboarding.certificateOfIncorporationPath} label="View" />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Memorandum of Association</span>
                  <FileLink path={data.onboarding.memorandumOfAssociationPath} label="View" />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Articles of Association</span>
                  <FileLink path={data.onboarding.articlesOfAssociationPath} label="View" />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Domain Ownership</span>
                  <FileLink path={data.onboarding.domainOwnershipPath} label="View" />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Signed Agreement</span>
                  <FileLink path={data.onboarding.signedAgreement} label="View" />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Video KYC</span>
                  <FileLink path={data.onboarding.videoKycPath} label="View" />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Directors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {directors.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No directors added</div>
                ) : (
                  directors.map((director) => (
                    <div key={director.id} className="rounded-lg border p-4 grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium">{director.name || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{director.email || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{director.phoneNumber || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium text-right">{director.address || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium">{director.countryCode?.countryName || '—'}</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Identity Proof</span>
                        <FileLink path={director.identityProofPath} label="View" />
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Proof of Address</span>
                        <FileLink path={director.proofOfAddressPath} label="View" />
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Register of Director</span>
                        <FileLink path={director.registerOfDirectorPath} label="View" />
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </Fragment>
  );
}


