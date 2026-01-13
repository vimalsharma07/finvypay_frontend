'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Frontend Root Page
 * 
 * Redirects directly to signin page
 */
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/signin');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Redirecting to sign in...</p>
      </div>
    </div>
  );
}
