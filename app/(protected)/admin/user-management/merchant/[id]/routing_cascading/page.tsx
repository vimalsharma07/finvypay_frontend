'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RoutingCascadingPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  useEffect(() => {
    // Redirect to payment-channels page by default
    router.replace(`/admin/user-management/merchant/${userId}/routing_cascading/payment-channels`);
  }, [userId, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to payment channels...</p>
      </div>
    </div>
  );
}

