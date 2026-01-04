'use client';

import dynamic from 'next/dynamic';
import { Cpu } from 'lucide-react';
import { Toolbar, ToolbarHeading, ToolbarActions } from '@/layouts/demo1/components/toolbar';
import { Container } from '@/components/common/container';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getAcquirerById, Acquirer } from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { getIconUrl as getS3IconUrl } from '@/lib/s3-url';

const AcquirerAccountsContent = dynamic(
  () => import('./acquirer-accounts-content').then(mod => ({ default: mod.AcquirerAccountsContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

// Helper function to get icon URL from publicId (uses dynamic S3 URL)
const getIconUrl = getS3IconUrl;

export default function AdminAcquirerAccountsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const acquirerIdFromUrl = searchParams.get('acquirerId');
  const [acquirer, setAcquirer] = useState<Acquirer | null>(null);
  const [loadingAcquirer, setLoadingAcquirer] = useState(false);

  // Fetch acquirer details when acquirerId is present
  useEffect(() => {
    if (acquirerIdFromUrl) {
      setLoadingAcquirer(true);
      getAcquirerById(acquirerIdFromUrl).then((response) => {
        handleApiResponse<Acquirer>(response, {
          onSuccess: (data) => {
            setAcquirer(data);
          },
          onError: () => {
            // Silently fail - we'll try to get name from accounts
          },
        });
        setLoadingAcquirer(false);
      }).catch(() => {
        setLoadingAcquirer(false);
      });
    } else {
      setAcquirer(null);
    }
  }, [acquirerIdFromUrl]);

  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Acquirer Accounts"
            icon={Cpu}
            description={
              acquirerIdFromUrl && acquirer
                ? (
                    <span className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">View and manage payment gateway acquirer accounts with configuration settings for</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold border border-primary/20">
                        {acquirer.iconUrl && (() => {
                          const iconUrl = getIconUrl(acquirer.iconUrl);
                          return iconUrl ? (
                            <img
                              src={iconUrl}
                              alt={acquirer.acquirerName}
                              className="h-5 w-5 object-cover rounded"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : null;
                        })()}
                        <span>{acquirer.acquirerName}</span>
                      </span>
                    </span>
                  )
                : acquirerIdFromUrl
                ? `View and manage payment gateway acquirer accounts with configuration settings for acquirer ID: ${acquirerIdFromUrl}`
                : 'View and manage payment gateway acquirer accounts with configuration settings, connection status, and account details'
            }
          />
          <ToolbarActions>
            <Button
              variant="primary"
              onClick={() => {
                if (acquirerIdFromUrl) {
                  router.push(`/admin/acquirers/acquirer-accounts/create/${acquirerIdFromUrl}`);
                } else {
                  // If no acquirerId, navigate to acquirers page to select one first
                  router.push('/admin/acquirers');
                }
              }}
            >
              <Plus className="size-4 mr-2" />
              Add Account
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <AcquirerAccountsContent />
      </Container>
    </Suspense>
  );
}

