'use client';

import dynamic from 'next/dynamic';
import { PageSkeleton } from '@/components/ui/skeletons';
import { Suspense, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarHeading } from '@/layouts/main/components/toolbar';
import { FileText } from 'lucide-react';
import {
  getMerchantAcquirerRequest,
  MerchantAcquirerRequest,
  GetMerchantAcquirerRequestResponse,
} from '@/lib/services/admin/acquirers';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { toast } from 'sonner';

const RequestDetailContent = dynamic(
  () => import('./request-detail-content').then(mod => ({ default: mod.RequestDetailContent })),
  {
    loading: () => <PageSkeleton />,
    ssr: false,
  }
);

export default function AdminAcquirerRequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const [request, setRequest] = useState<MerchantAcquirerRequest | null>(null);

  // Fetch request title for toolbar
  useEffect(() => {
    if (requestId) {
      getMerchantAcquirerRequest(requestId).then((response) => {
        handleApiResponse<GetMerchantAcquirerRequestResponse>(response, {
          onSuccess: (data) => {
            if (data && data.success && data.data) {
              setRequest(data.data);
            }
          },
          onError: () => {
            // Silently fail - toolbar will show default
          },
        });
      }).catch(() => {
        // Silently fail
      });
    }
  }, [requestId]);

  return (
    <Suspense>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Acquirer Request Details"
            description={request ? `Request #${request.id} — ${request.merchantProfile?.merchantProfileName ?? request.merchant?.name ?? 'Acquirer request'}` : 'Loading request details...'}
            icon={FileText}
          />
        </Toolbar>
      </Container>
      <Container>
        <RequestDetailContent />
      </Container>
    </Suspense>
  );
}
