'use client';

import { ReactNode, useState } from 'react';
import { RiErrorWarningFill } from '@remixicon/react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
  MutationCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';

const QueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch on tab switch
            refetchOnMount: true, // Refetch when component mounts
            refetchOnReconnect: true, // Refetch when network reconnects
            retry: 1, // Retry failed requests once
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            refetchInterval: false, // Disable polling by default
          },
          mutations: {
            retry: false, // Don't retry mutations
            onError: (error: any) => {
              // Global mutation error handling
              const message = error?.response?.data?.message || 
                             error?.message || 
                             'An error occurred. Please try again.';
              toast.error(message);
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error: any) => {
            // Only show toast for non-401 errors (401 handled by auth)
            if (error?.status !== 401) {
              const message =
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong. Please try again.';

              toast.custom(
                () => (
                  <Alert variant="mono" icon="destructive" close={false}>
                    <AlertIcon>
                      <RiErrorWarningFill />
                    </AlertIcon>
                    <AlertTitle>{message}</AlertTitle>
                  </Alert>
                ),
                {
                  position: 'top-right',
                  duration: 5000,
                },
              );
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            // Mutation errors handled in defaultOptions
          },
        }),
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

export { QueryProvider };
