'use client';

import React, { ReactNode, useState } from 'react';
import { SessionProvider } from 'next-auth/react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthInitializer } from '@/hooks/useAuthInitializer';
import Modal from '@/components/ui/Modal/Modal';
import { FocusScrollProvider } from './FocusScrollProvider';

interface Props {
  children: ReactNode;
}

function AuthInitializer() {
  useAuthInitializer();
  return null;
}

export const Providers = ({ children }: Props) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
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
