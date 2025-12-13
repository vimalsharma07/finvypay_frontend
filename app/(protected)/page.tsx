'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRedirectPathByRole, getUserRole } from '@/lib/utils/menu-utils';
import { isAuthenticated } from '@/lib/auth-storage';

/**
 * Protected Root Page
 * 
 * Redirects authenticated users to their role-based dashboard
 * If not authenticated, redirects to signin
 */
export default function ProtectedPage() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.replace('/signin');
      return;
    }

    // Function to attempt redirect with retry logic
    const attemptRedirect = (retries = 3) => {
      const role = getUserRole();
      
      if (role) {
        // Role found, redirect immediately
        const redirectPath = getRedirectPathByRole(role);
        router.replace(redirectPath);
        setIsRedirecting(false);
      } else if (retries > 0) {
        // Role not found yet, retry after a short delay
        setTimeout(() => {
          attemptRedirect(retries - 1);
        }, 200);
      } else {
        // No role found after retries, redirect to home
        console.warn('User role not found, redirecting to home');
        router.replace('/');
        setIsRedirecting(false);
      }
    };

    // Start redirect attempt
    attemptRedirect();
  }, [router]);

  // Show loading state while redirecting
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    );
  }

  return null;
}
