'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Cpu } from 'lucide-react';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarActions,
} from '@/layouts/demo1/components/toolbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createMerchantAcquirerAccount } from '@/lib/services/admin/merchant-acquirer-account';
import { handleApiResponse } from '@/lib/utils/api-response-handler';
import { CreateMerchantAcquirerAccountForm } from '@/components/admin/merchant-acquirer-account/CreateMerchantAcquirerAccountForm';

export default function CreateAcquirerAccountPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = params.id as string;
  const returnUrl = searchParams?.get('returnUrl') || `/admin/user-management/merchant/${userId}/routing_cascading/acquirer-accounts`;
  const userProfileId = searchParams?.get('userProfileId') || '';

  const handleSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        userId: Number(userId),
        userProfileId: userProfileId ? Number(userProfileId) : undefined,
      };

      const response = await createMerchantAcquirerAccount(payload);
      
      handleApiResponse(response, {
        onSuccess: (data) => {
          if (data && data.message) {
            toast.success(data.message || 'Acquirer account created successfully');
          } else {
            toast.success('Acquirer account created successfully');
          }
          router.push(returnUrl);
        },
        onError: (errorMessage) => {
          toast.error(errorMessage || 'Failed to create acquirer account');
        },
      });
    } catch (error) {
      console.error('Create acquirer account error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title="Add Acquirer Account"
            description="Create a new payment gateway acquirer account connector with configuration settings and credentials for this merchant"
            icon={Cpu}
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
          <CreateMerchantAcquirerAccountForm
            userId={Number(userId)}
            userProfileId={userProfileId ? Number(userProfileId) : undefined}
            onSubmit={handleSubmit}
          />
        </div>
      </Container>
    </>
  );
}

