'use client';

import { useEffect } from 'react';
import { isAuthenticated } from '@/lib/auth-storage';
import { initializeAuthState } from '@/lib/utils/auth-helpers';

// Auth provider that initializes auth state on app load
interface AuthProviderProps {
  children: React.ReactNode;
  session?: any;
}

export function AuthProvider({ children }: AuthProviderProps) {
  useEffect(() => {
    // Initialize auth state if user is authenticated
    // This will rehydrate Zustand store from localStorage and fetch permissions if needed
    if (isAuthenticated()) {
      initializeAuthState().catch((error) => {
        console.error('[AuthProvider] Failed to initialize auth state:', error);
      });
    }
  }, []);

  return <>{children}</>;
}
