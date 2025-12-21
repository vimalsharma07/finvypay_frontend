'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createMerchantGateway } from '@/lib/services/admin/merchant-gateway';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { CreateMerchantGatewayForm } from '@/components/admin/merchant-gateway/CreateMerchantGatewayForm';

export default function CreatePaymentChannelPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params.id as string;
  const returnUrl = searchParams?.get('returnUrl') || `/admin/user-management/merchant/${userId}/routing_cascading/payment-channels`;
  const userProfileId = searchParams?.get('userProfileId') || '';

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        userId: Number(userId),
        userProfileId: userProfileId ? Number(userProfileId) : undefined,
      };

      const response = await createMerchantGateway(payload);
      
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.message) {
            toast.success(data.message || 'Payment channel created successfully');
          } else {
            toast.success('Payment channel created successfully');
          }
          router.push(returnUrl);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create payment channel');
        },
      });
    } catch (error) {
      console.error('Create payment channel error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Add Payment Channel"
            description="Create a new payment channel (gateway connector) for this merchant user"
          />
          <ToolbarActions>
            <Button
              variant="outline"
              onClick={() => router.push(returnUrl)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <div className="bg-card rounded-lg border p-6">
          <CreateMerchantGatewayForm
            userId={Number(userId)}
            userProfileId={userProfileId ? Number(userProfileId) : undefined}
            onSubmit={handleSubmit}
          />
        </div>
      </Container>
    </>
  );
}

