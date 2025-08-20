'use client';

import React, { ReactNode, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthInitializer } from '@/components/AuthInitializer';
import Modal from '@/components/Modal';
import { FocusScrollProvider } from './FocusScrollProvider';

interface Props {
  children: ReactNode;
}

export const Providers = ({ children }: Props) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <FocusScrollProvider>
          <AuthInitializer />
          {children}
          <Modal />
          {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
        </FocusScrollProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
};
